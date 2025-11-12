import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Si el usuario tiene token, puede acceder
  if (authService.hasToken()) {
    return true;
  }

  // 🚫 Si no tiene token, lo enviamos al login
  router.navigate(['/login']);
  return false;
};
