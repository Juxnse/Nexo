import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// Estrategias existentes
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

// OTP fallback
import { EmailOtpController } from './email-otp/email-otp.controller';
import { EmailOtpService } from './email-otp/email-otp.service';

// Local (nuevo)
import { LocalAuthController } from './local/local.controller';
import { LocalAuthService } from './local/local.service';

// Mailer compartido
import { MailerService } from './mailer.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    AuthController,       // Google OAuth endpoints
    EmailOtpController,   // OTP endpoints
    LocalAuthController,  // Local auth endpoints (nuevo)
  ],
  providers: [
    AuthService,
    EmailOtpService,
    LocalAuthService,
    MailerService,
    GoogleStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
