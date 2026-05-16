import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isInitialized()) {
    return authService.isAuthenticated()
      ? true
      : router.createUrlTree(['/login']);
  }

  return toObservable(authService.isInitialized).pipe(
    filter(Boolean),
    take(1),
    map(() =>
      authService.isAuthenticated() ? true : router.createUrlTree(['/login']),
    ),
  );
};
