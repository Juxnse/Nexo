import { Component, Input } from '@angular/core';
import { EventsService } from '../../core/events.service';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rsvp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rsvp-button.component.html',
  styleUrls: ['./rsvp-button.component.scss']
})
export class RsvpButtonComponent {
  @Input() eventId!: string;
  currentStatus: 'going' | 'interested' | 'not_going' | null = null;
  loading = false;

  constructor(private eventsService: EventsService, private auth: AuthService) {}

  async setStatus(status: 'going' | 'interested' | 'not_going') {
    if (!this.auth.hasToken()) {
      alert('Por favor inicia sesión para confirmar tu asistencia.');
      return;
    }

    this.loading = true;

    this.eventsService.createRsvp(this.eventId, status).subscribe({
      next: (res) => {
        this.currentStatus = res.status;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error al guardar tu respuesta');
        this.loading = false;
      },
    });
  }
}
