import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { supabase } from '../supabase/supabase.client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //Redirige al login de Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  //Callback de Google
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;

    // Buscar usuario en Supabase por email
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    let finalUser;

    if (existingUser) {
      // Si ya existe → actualizar siempre name y picture
      await supabase
        .from('users')
        .update({
          name: user.name,
          picture: user.picture,
        })
        .eq('id', existingUser.id);

      // Volvemos a leer desde la DB para tener datos actualizados
      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      finalUser = updatedUser;
    } else {
      // Si no existe → insertamos
      const { data: newUser } = await supabase
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

      finalUser = newUser;
    }

    // Generar JWT solo con id + email
    const payload = { sub: finalUser.id, email: finalUser.email };
    const token = await this.authService.generateJwt(payload);

    // Redirigir al frontend con el token
    return res.redirect(`http://localhost:4200/callback?token=${token}`);
  }

  // 🔹 Ruta protegida → devuelve datos completos desde DB
  // 🔹 Ruta protegida → devuelve datos completos desde DB
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Req() req) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, picture')
    .eq('id', req.user.sub)
    .single();

  if (error || !user) {
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
