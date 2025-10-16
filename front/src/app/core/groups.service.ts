// src/app/core/groups.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Group {
  id: string;
  slug: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  join_policy: 'open' | 'request' | 'invite';
  tags: string[];
  city?: string;
  country?: string;
  created_by: string;
}

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private apiUrl = `${environment.apiBaseUrl}/groups`;

  constructor(private http: HttpClient) {}

  // Listar grupos con filtros opcionales
  getGroups(filters?: { city?: string; tag?: string; visibility?: string }): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl, { params: { ...filters } });
  }

  // Obtener detalle de grupo
  getGroupById(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  // Crear grupo
  createGroup(data: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, data);
  }

  // Unirse a un grupo
  joinGroup(groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/join`, {});
  }

  // Actualizar rol/status de un miembro
  updateMember(groupId: string, userId: string, updates: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${groupId}/members/${userId}`, updates);
  }
}
