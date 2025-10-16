import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  userEmail: string | null = null;

  constructor(private auth: AuthService, private router: Router) {
    // ejemplo simple: si quieres mostrar el email desde el perfil
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.userEmail = res?.user?.email || 'Usuario';
      },
      error: () => {
        this.userEmail = 'Usuario';
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
