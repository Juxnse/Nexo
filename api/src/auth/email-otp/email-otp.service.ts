import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { supabase } from '../../supabase/supabase.client';
import * as argon2 from 'argon2';
import * as nodemailer from 'nodemailer';
import { AuthService } from '../auth.service';

@Injectable()
export class EmailOtpService {
  constructor(private readonly authService: AuthService) {}

  // ✅ Generar OTP y enviarlo por correo
  async generateOtp(email: string) {
    // 1. Buscar usuario en la tabla users
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    // 2. Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await argon2.hash(code);

    // 3. Guardar OTP en Supabase
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
    await supabase.from('email_otp').insert([
      {
        user_id: user.id,
        code_hash: codeHash,
        expires_at: expiresAt,
      },
    ]);

    // 4. Enviar OTP por correo con nodemailer (Mailtrap en dev)
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: false, // 👈 Importante para Mailtrap
    });

    // Verificar conexión con SMTP antes de enviar
    try {
      await transporter.verify();
      console.log('✅ Conexión SMTP exitosa');
    } catch (err) {
      console.error('❌ Error en conexión SMTP:', err);
      throw new BadRequestException('Error al conectar con el servidor SMTP');
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Tu código OTP',
      text: `Tu código de acceso es: ${code}. Expira en 10 minutos.`,
    });

    return { message: 'OTP enviado al correo registrado' };
  }

  // ✅ Verificar OTP y devolver JWT
  async verifyOtp(email: string, code: string) {
    // Buscar usuario
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    // Buscar OTP válido
    const { data: otp } = await supabase
      .from('email_otp')
      .select('*')
      .eq('user_id', user.id)
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!otp) throw new BadRequestException('No hay OTP válido');

    if (new Date(otp.expires_at) < new Date()) {
      throw new BadRequestException('OTP expirado');
    }

    // Comparar código ingresado con hash
    const isValid = await argon2.verify(otp.code_hash, code);
    if (!isValid) throw new UnauthorizedException('OTP inválido');

    // Marcar OTP como usado
    await supabase
      .from('email_otp')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', otp.id);

    // Emitir nuevo JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.authService.generateJwt(payload);

    return {
      message: 'OTP verificado',
      access_token: token,
    };
  }
}
