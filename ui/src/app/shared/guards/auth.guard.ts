import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const isAdminPath = state.url.startsWith('/admin') || state.url.startsWith('/settings');

  // Non-admin paths (like /landing) just require standard authentication
  if (!isAdminPath) {
    return true;
  }

  const user = authService.currentUser();
  if (user) {
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.role === 'super_admin';
    if (!isAdmin) {
      router.navigate(['/landing']);
      return false;
    }
    return true;
  }

  // Asynchronously wait for the user to be loaded from checkAuth()
  return toObservable(authService.currentUser).pipe(
    filter(() => !authService.isAuthenticated() || authService.currentUser() !== null),
    take(1),
    map(u => {
      if (!authService.isAuthenticated()) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
      const loadedUser = authService.currentUser();
      const isAdmin = loadedUser && (loadedUser.role === 'admin' || loadedUser.role === 'superadmin' || loadedUser.role === 'super_admin');
      if (!isAdmin) {
        router.navigate(['/landing']);
        return false;
      }
      return true;
    })
  );
};
