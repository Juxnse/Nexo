import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Member {
  id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'banned';
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private apiUrl = `${environment.apiBaseUrl}/groups`;

  constructor(private http: HttpClient) {}

  // Lista de miembros
  getMembers(groupId: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/${groupId}/members`);
  }

  // Unirse a un grupo
  joinGroup(groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/join`, {});
  }

  // Actualizar rol o status
  updateMember(groupId: string, userId: string, updates: Partial<Member>): Observable<Member> {
    return this.http.patch<Member>(`${this.apiUrl}/${groupId}/members/${userId}`, updates);
  }
}
