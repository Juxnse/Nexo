import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  authorizationParams(): { [key: string]: string } {
    return { prompt: 'select_account' };
  }

  // 🔹 Esta versión es la correcta: devuelve el objeto directamente (sin "done")
  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { sub, email, picture, name, given_name, family_name } = profile._json;

    return {
      email,
      name:
        name ||
        profile.displayName ||
        `${given_name || ''} ${family_name || ''}`.trim() ||
        email,
      picture: picture || null,
      googleId: sub,
    };
  }
}
