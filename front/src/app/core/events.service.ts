import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventCreateDto {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  venue_kind?: 'in_person' | 'online';
  venue_name?: string;
  venue_link?: string;
  capacity?: number;
  city?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 🔹 Listar eventos de un grupo
  getGroupEvents(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/groups/${groupId}/events`);
  }

  // 🔹 Crear nuevo evento
  createEvent(groupId: string, body: EventCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/events`, body);
  }

  // 🔹 Crear RSVP
  createRsvp(
    eventId: string,
    status: 'going' | 'interested' | 'not_going'
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/rsvp`, { status });
  }

  // 🔹 Listar RSVPs de un evento
  getEventRsvps(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/events/${eventId}/rsvps`);
  }

  // 🔹 Eliminar RSVP
  removeRsvp(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${eventId}/rsvp`);
  }

  // 🔹 NUEVO: Obtener todos los eventos públicos (para Dashboard)
  getAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/events`);
  }
}
