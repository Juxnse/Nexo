import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent {
  email: string = '';
  code: string = '';
  step: 'request' | 'verify' = 'request';

  message = '';
  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  //Paso 1: solicitar OTP
  requestOtp() {
    if (!this.email) {
      this.errorMessage = 'Debes ingresar un correo';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.message = '';

    this.auth.requestOtp(this.email).subscribe({
      next: () => {
        this.message = 'OTP enviado. Revisa tu correo.';
        this.step = 'verify';
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al enviar OTP';
        this.loading = false;
      },
    });
  }

  //Paso 2: verificar OTP
  verifyOtp() {
    if (!this.code) {
      this.errorMessage = 'Debes ingresar el código';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.message = '';

    this.auth.verifyOtp(this.email, this.code).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);

        // Redirigimos al dashboard en vez de al perfil
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al verificar OTP';
        this.loading = false;
      },
    });
  }
}
