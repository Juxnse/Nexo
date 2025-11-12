import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  errorMessage = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.user = res.user;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el perfil';
        this.loading = false;
      },
    });
  }

  editProfile(){
    
  }

  logout() {
    this.auth.logout();
  }
}
