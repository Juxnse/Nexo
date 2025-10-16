import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Post {
  id: string;
  group_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private apiUrl = `${environment.apiBaseUrl}/groups`;

  constructor(private http: HttpClient) {}

  // Obtener posts de un grupo
  getPosts(groupId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${groupId}/posts`);
  }

  // Crear un post en un grupo
  createPost(groupId: string, content: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${groupId}/posts`, { content });
  }
}
