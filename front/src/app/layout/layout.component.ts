import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  isLoggedIn = false;
  menuOpen = false;
  userEmail: string | null = null;
  userInitial: string = '?';
  userPicture: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.auth.authState$.subscribe((state) => {
      this.isLoggedIn = state;

      if (state) {
        this.loadUserProfile();

        // 👇 Si está logueado y está en Home, redirige al dashboard
        if (this.router.url === '/') {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.resetUser();
      }

      this.cd.detectChanges();
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.router.navigate(['/']); // vuelve al home público
  }

  navigateHome() {
    if (this.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadUserProfile() {
    this.auth.getProfile().subscribe({
      next: (res) => {
        const user = res?.user || {};
        this.userEmail = user.email || null;
        this.userPicture = user.picture || null;

        if (this.userPicture) {
          this.userInitial = '';
        } else if (this.userEmail) {
          this.userInitial = this.userEmail.charAt(0).toUpperCase();
        } else {
          this.userInitial = '?';
        }

        this.cd.detectChanges();
      },
      error: () => {
        this.resetUser();
      },
    });
  }

  private resetUser() {
    this.userEmail = null;
    this.userInitial = '?';
    this.userPicture = null;
    this.cd.detectChanges();
  }
}
