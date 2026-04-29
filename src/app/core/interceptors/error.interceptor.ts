import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { authActions } from '../../store/auth/auth.actions';
import { APP_ROUTES } from '../constants/app.constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store  = inject(Store);
  const router = inject(Router);
  const toast  = inject(MessageService);

  return next(req).pipe(
    catchError(err => {
      switch (err.status) {
        case 401:
          store.dispatch(authActions.logout());
          router.navigate([APP_ROUTES.auth.login]);
          break;
        case 403:
          toast.add({ severity: 'error', summary: 'Access Denied', detail: 'You do not have permission.' });
          break;
        case 404:
          toast.add({ severity: 'warn', summary: 'Not Found', detail: err.error?.error ?? 'Resource not found.' });
          break;
        default:
          toast.add({ severity: 'error', summary: 'Error', detail: err.error?.error ?? 'An unexpected error occurred.' });
      }
      return throwError(() => err);
    })
  );
};
