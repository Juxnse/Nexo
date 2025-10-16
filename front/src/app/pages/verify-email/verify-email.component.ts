import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  message = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // leer parámetros de la URL
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.message = 'Link inválido o incompleto';
      this.loading = false;
      return;
    }

    // llamar al backend para verificar email
    this.auth.verifyEmail(email, token).subscribe({
      next: (res) => {
        this.message = res.message || 'Correo verificado correctamente';
        this.loading = false;

        // redirigir a login en 3s
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Error verificando el correo';
        this.loading = false;
      },
    });
  }
}
