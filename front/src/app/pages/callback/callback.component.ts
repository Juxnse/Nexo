import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a los parámetros de la URL
    this.route.queryParams.subscribe((params) => {
      let token = params['token'];

      // 🔹 Si el token llega en el fragmento (#token=xxx)
      if (!token && window.location.hash.includes('token=')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        token = hashParams.get('token') || '';
      }

      if (token) {
        // Guardar token en localStorage
        this.authService.saveToken(token);

        // 🔹 Forzar actualización del estado de sesión
        console.log('✅ Token recibido y guardado');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      } else {
        console.warn('⚠️ Token no encontrado en callback');
        this.router.navigate(['/login']);
      }
    });
  }
}
