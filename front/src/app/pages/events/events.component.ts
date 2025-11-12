import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventsService, EventCreateDto } from '../../core/events.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-group-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  @Input() groupId!: string;

  events: any[] = [];
  creating = false;
  newEvent: Partial<EventCreateDto> = {
    timezone: 'America/Bogota',
    venue_kind: 'in_person',
  };

  constructor(
    private eventsService: EventsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.groupId) this.loadEvents();
  }

  reloadEvents() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventsService.getGroupEvents(this.groupId).subscribe({
      next: (data) => {
        // Asegurar que cada evento tenga user_status inicial
        this.events = data.map((ev: any) => ({
          ...ev,
          user_status: ev.user_status || null,
        }));
      },
      error: (err) => console.error('❌ Error cargando eventos', err),
    });
  }

  createEvent() {
    if (!this.authService.hasToken()) {
      alert('Debes iniciar sesión para crear un evento.');
      return;
    }

    if (!this.newEvent.title || !this.newEvent.start_at || !this.newEvent.end_at) {
      alert('Completa título y fechas.');
      return;
    }

    const dto: EventCreateDto = {
      ...this.newEvent,
      start_at: new Date(this.newEvent.start_at!).toISOString(),
      end_at: new Date(this.newEvent.end_at!).toISOString(),
      title: this.newEvent.title!,
      timezone: this.newEvent.timezone!,
    };

    this.creating = true;
    this.eventsService.createEvent(this.groupId, dto).subscribe({
      next: (created) => {
        this.events.unshift(created);
        this.creating = false;
        this.newEvent = { timezone: 'America/Bogota', venue_kind: 'in_person' };
      },
      error: (err) => {
        console.error('❌ Error creando evento', err);
        alert(err.error?.message || 'Error al crear evento');
        this.creating = false;
      },
    });
  }

  /** Cambiar estado RSVP del usuario */
  setRSVP(event: any, status: 'attending' | 'interested' | 'declined') {
    if (!this.authService.hasToken()) {
      alert('Inicia sesión para registrar tu asistencia.');
      return;
    }

    event.user_status = status; // Simulación de actualización visual inmediata

    // Aquí podrías hacer una llamada HTTP real, ej:
    // this.eventsService.updateRSVP(event.id, status).subscribe(...)
  }
}
