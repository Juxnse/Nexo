import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async send(opts: { to: string; subject: string; html: string }) {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL ?? 'no-reply@meetup-app.com',
        ...opts,
      });
    } catch (e: any) {
      throw new InternalServerErrorException(`Error enviando correo: ${e.message}`);
    }
  }
}
