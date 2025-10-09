import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LocalAuthService } from './local.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('auth')
export class LocalAuthController {
  constructor(private readonly service: LocalAuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.service.verifyEmail(dto);
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.service.resendVerification(dto);
  }

  @Post('password/forgot')
  async forgot(@Body() dto: ForgotPasswordDto) {
    return this.service.forgotPassword(dto);
  }

  @Post('password/reset')
  async reset(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto);
  }
}
