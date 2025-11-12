import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { supabase } from '../supabase/supabase.client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔹 Redirige al login de Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Este método no hace nada porque el guard se encarga del redirect a Google
  }

  // 🔹 Callback de Google
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user: any = req.user;

    if (!user || !user.email) {
      console.error('❌ Perfil de Google inválido:', user);
      return res.status(401).json({ message: 'Error autenticando con Google' });
    }

    // Buscar usuario existente
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (findError) {
      console.error('❌ Error consultando usuario:', findError);
      return res.status(500).json({ message: 'Error al consultar usuario' });
    }

    let finalUser;

    if (existingUser) {
      // Actualizar datos
      await supabase
        .from('users')
        .update({
          name: user.name,
          picture: user.picture,
        })
        .eq('id', existingUser.id);

      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      finalUser = updatedUser;
    } else {
      // Crear nuevo usuario
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: user.email,
            name: user.name,
            picture: user.picture,
            google_id: user.googleId,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creando usuario:', insertError);
        return res.status(500).json({ message: 'Error creando usuario' });
      }

      finalUser = newUser;
    }

    // 🔸 Generar JWT válido por 7 días
    const payload = { sub: finalUser.id, email: finalUser.email };
    const token = await this.authService.generateJwt(payload);

    console.log('✅ Usuario autenticado:', finalUser.email);

    // 🔹 Redirigir al callback del frontend con el token limpio
    const redirectUrl = `${process.env.FRONTEND_URL}/callback?token=${encodeURIComponent(token)}`;
    return res.redirect(redirectUrl);
  }

  // 🔹 Ruta protegida: perfil del usuario
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, picture')
      .eq('id', req.user.sub)
      .single();

    if (error || !user) {
      console.warn('⚠️ Usuario no encontrado en Supabase:', error?.message);
      return {
        user: {
          id: req.user.sub,
          email: req.user.email,
          name: req.user.email,
          picture: null,
        },
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        picture: user.picture || null,
      },
    };
  }
}
