import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  // 👇 Nuevo: estado reactivo de autenticación
  private authState = new BehaviorSubject<boolean>(this.hasToken());
  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // 🔹 Google OAuth
  loginWithGoogle() {
    window.location.href = `${this.apiUrl}/google`;
  }

  // 🔹 Registro local
  register(
    email: string,
    password: string,
    confirmPassword: string,
    documentId?: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      email,
      password,
      confirmPassword,
      documentId,
    });
  }

  // 🔹 Login local
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // 🔹 Verificar email
  verifyEmail(email: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { email, token });
  }

  // 🔹 Reenviar verificación
  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  // 🔹 Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/forgot`, { email });
  }

  // 🔹 Reset password
  resetPassword(
    email: string,
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/reset`, {
      email,
      token,
      newPassword,
      confirmPassword,
    });
  }

  // 🔹 Solicitar OTP
  requestOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/email-otp`, { email });
  }

  // 🔹 Verificar OTP
  verifyOtp(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/email-otp/verify`, { email, code });
  }

  // 🔹 Obtener perfil
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  // 🔹 Guardar token
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
    this.authState.next(true); // 👈 Notifica login
  }

  // 🔹 Obtener token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // 🔹 Logout
  logout() {
    localStorage.removeItem('access_token');
    this.authState.next(false); // 👈 Notifica logout
    this.router.navigate(['/login']);
  }

  // 🔹 Chequear sesión
  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
