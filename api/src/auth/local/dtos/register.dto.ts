import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message: 'La contraseña debe incluir mayúscula, minúscula, número y carácter especial',
  })
  password!: string;

  @IsString()
  confirmPassword!: string;

  @IsOptional()
  @Matches(/^\d{6,12}$/, { message: 'La cédula debe tener entre 6 y 12 dígitos' })
  documentId?: string;
}
