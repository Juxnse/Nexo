import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { EventsService } from '../../core/events.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  userEmail: string | null = null;
  featuredEvents: any[] = [];
  loadingEvents = false;

  constructor(
    private auth: AuthService,
    private eventsService: EventsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadFeaturedEvents();
  }

  // 🔹 Cargar usuario autenticado
  loadUser(): void {
    this.auth.getProfile().subscribe({
      next: (res: any) => {
        this.userEmail = res?.user?.email || 'Usuario';
      },
      error: () => {
        this.userEmail = 'Usuario';
      },
    });
  }

  // 🔹 Cargar eventos destacados
  loadFeaturedEvents(): void {
    this.loadingEvents = true;
    this.eventsService.getAllEvents().subscribe({
      next: (data: any[]) => {
        // Mostrar los 5 próximos eventos
        this.featuredEvents = data
          .sort(
            (a, b) =>
              new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
          )
          .slice(0, 5);
        this.loadingEvents = false;
      },
      error: (err: any) => {
        console.error('Error cargando eventos destacados', err);
        this.loadingEvents = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
