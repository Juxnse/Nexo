import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { supabase } from '../../supabase/supabase.client';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { MailerService } from '../mailer.service';
import { AuthService } from '../auth.service'; // ya existe en tu proyecto

// Tipos auxiliares para que TS no marque errores
type UserRow = {
  id: string;
  email: string;
  password_hash?: string | null;
  email_verified_at?: string | null;
  status?: string | null;
};

type VerificationToken = {
  id: string;
  token_hash: string;
  expires_at: string;
  consumed_at: string | null;
};

type ResetToken = {
  id: string;
  token_hash: string;
  expires_at: string;
  consumed_at: string | null;
};

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly mailer: MailerService,
    private readonly auth: AuthService, // usamos tu generateJwt()
  ) {}

  private normalizeEmail(e: string) {
    return e.trim().toLowerCase();
  }

  private async createHashedToken() {
    const token = randomBytes(32).toString('hex');
    const token_hash = await argon2.hash(token);
    return { token, token_hash };
  }

  // ---------- Registro ----------
  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const email = this.normalizeEmail(dto.email);

    // Revisar si ya existe
    const { data: existing, error: findErr } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email)
      .maybeSingle<UserRow>();

    if (findErr) throw new InternalServerErrorException(findErr.message);
    if (existing) throw new ConflictException('Email ya registrado');

    const password_hash = await argon2.hash(dto.password);

    // Insertar usuario
    const { data: user, error: insErr } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        document_id: dto.documentId ?? null,
        status: 'pending_verification',
        mfa_preference: 'google_2sv',
      })
      .select('id, email')
      .single<UserRow>();

    if (insErr) throw new InternalServerErrorException(insErr.message);

    // Generar token de verificación
    const { token, token_hash } = await this.createHashedToken();
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await supabase.from('email_verifications').delete().eq('user_id', user.id);
    await supabase.from('email_verifications').insert({
      user_id: user.id,
      token_hash,
      expires_at,
    });

    const link = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(
      email,
    )}&token=${token}`;

    await this.mailer.send({
      to: email,
      subject: 'Verifica tu correo',
      html: `<p>Bienvenido/a, confirma tu cuenta:</p>
             <a href="${link}">Verificar correo</a>`,
    });

    return { message: 'Registro iniciado. Revisa tu correo.' };
  }

  // ---------- Login ----------
  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, email_verified_at, status')
      .ilike('email', email)
      .maybeSingle<UserRow>();

    if (error) throw new InternalServerErrorException(error.message);
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await argon2.verify(user.password_hash, dto.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    if (user.status !== 'active' || !user.email_verified_at) {
      throw new ForbiddenException('Debes verificar tu correo');
    }

    // ✅ corrección: ahora pasamos un solo objeto
    const token = await this.auth.generateJwt({
      sub: user.id,
      email: user.email,
    });

    return { message: 'Login exitoso', access_token: token };
  }

  // ---------- Verificar email ----------
  async verifyEmail(dto: VerifyEmailDto) {
    const email = this.normalizeEmail(dto.email);

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email)
      .maybeSingle<UserRow>();

    if (!user) throw new BadRequestException('Usuario no encontrado');

    const { data: tokens } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('user_id', user.id);

    if (!tokens || tokens.length === 0) {
      throw new BadRequestException('Token inválido o expirado');
    }

    let match: VerificationToken | null = null;
    for (const t of tokens as VerificationToken[]) {
      if (t.consumed_at) continue;
      if (new Date(t.expires_at).getTime() < Date.now()) continue;
      const ok = await argon2.verify(t.token_hash, dto.token);
      if (ok) match = t;
    }

    if (!match) throw new BadRequestException('Token inválido o expirado');

    await supabase
      .from('users')
      .update({ email_verified_at: new Date().toISOString(), status: 'active' })
      .eq('id', user.id);

    await supabase
      .from('email_verifications')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', match.id);

    return { message: 'Correo verificado. Ya puedes iniciar sesión.' };
  }

  // ---------- Reenviar verificación ----------
  async resendVerification(dto: ResendVerificationDto) {
    const email = this.normalizeEmail(dto.email);

    const { data: user } = await supabase
      .from('users')
      .select('id, status, email_verified_at')
      .ilike('email', email)
      .maybeSingle<UserRow>();

    if (!user) return { message: 'Si existe, se reenviará el correo.' };
    if (user.status === 'active' && user.email_verified_at) {
      return { message: 'La cuenta ya está verificada.' };
    }

    await supabase.from('email_verifications').delete().eq('user_id', user.id);

    const { token, token_hash } = await this.createHashedToken();
    const expires_at = new Date(Date.now() + 60 * 60 * 1000);

    await supabase.from('email_verifications').insert({
      user_id: user.id,
      token_hash,
      expires_at,
    });

    const link = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(
      email,
    )}&token=${token}`;

    await this.mailer.send({
      to: email,
      subject: 'Verifica tu correo',
      html: `<p>Tu nuevo enlace:</p>
             <a href="${link}">Verificar correo</a>`,
    });

    return { message: 'Si existe, se envió un nuevo correo de verificación.' };
  }

  // ---------- Recuperar contraseña ----------
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = this.normalizeEmail(dto.email);

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email)
      .maybeSingle<UserRow>();

    if (!user) return { message: 'Si existe, se enviarán instrucciones.' };

    await supabase.from('password_resets').delete().eq('user_id', user.id);

    const { token, token_hash } = await this.createHashedToken();
    const expires_at = new Date(Date.now() + 60 * 60 * 1000);

    await supabase.from('password_resets').insert({
      user_id: user.id,
      token_hash,
      expires_at,
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(
      email,
    )}&token=${token}`;

    await this.mailer.send({
      to: email,
      subject: 'Restablece tu contraseña',
      html: `<p>Usa este enlace:</p>
             <a href="${link}">Restablecer contraseña</a>`,
    });

    return { message: 'Si existe, se enviarán instrucciones.' };
  }

  // ---------- Resetear contraseña ----------
  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const email = this.normalizeEmail(dto.email);
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email)
      .maybeSingle<UserRow>();

    if (!user) throw new BadRequestException('Solicitud inválida');

    const { data: tokens } = await supabase
      .from('password_resets')
      .select('*')
      .eq('user_id', user.id);

    if (!tokens || tokens.length === 0) {
      throw new BadRequestException('Token inválido o expirado');
    }

    let match: ResetToken | null = null;
    for (const t of tokens as ResetToken[]) {
      if (t.consumed_at) continue;
      if (new Date(t.expires_at).getTime() < Date.now()) continue;
      const ok = await argon2.verify(t.token_hash, dto.token);
      if (ok) match = t;
    }

    if (!match) throw new BadRequestException('Token inválido o expirado');

    const password_hash = await argon2.hash(dto.newPassword);
    await supabase.from('users').update({ password_hash }).eq('id', user.id);
    await supabase
      .from('password_resets')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', match.id);

    return { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
  }
}
