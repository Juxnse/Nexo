import { Body, Controller, Post } from '@nestjs/common';
import { EmailOtpService } from './email-otp.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth/email-otp')
export class EmailOtpController {   // 👈 export agregado aquí
  constructor(private readonly emailOtpService: EmailOtpService) {}

  @Post()
  async requestOtp(@Body() body: RequestOtpDto) {
    return this.emailOtpService.generateOtp(body.email);
  }

  @Post('verify')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.emailOtpService.verifyOtp(body.email, body.code);
  }
}
