import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '../../core/models/auth.model';
import { API_ROUTES } from '../../core/constants/api.constants';
import { APP_ROUTES } from '../../core/constants/app.constants';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import { authActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly http     = inject(HttpClient);
  private readonly router   = inject(Router);
  private readonly storage  = inject(AuthStorageService);
  private readonly toast    = inject(MessageService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.login),
      switchMap(({ request }) =>
        this.http.post<AuthResponse>(API_ROUTES.auth.login, request).pipe(
          map(response => authActions.loginSuccess({ response })),
          catchError(err => of(authActions.loginFailure({ error: err.error?.error ?? 'Login failed' })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.register),
      switchMap(({ request }) =>
        this.http.post<AuthResponse>(API_ROUTES.auth.register, request).pipe(
          map(response => authActions.registerSuccess({ response })),
          catchError(err => of(authActions.registerFailure({ error: err.error?.error ?? 'Registration failed' })))
        )
      )
    )
  );

  onAuthSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.loginSuccess, authActions.registerSuccess),
      tap(({ response }) => {
        this.storage.saveTokens(response.accessToken, response.refreshToken);
        this.storage.saveUser({
          email: response.email, firstName: response.firstName,
          lastName: response.lastName, role: response.role,
        });
        this.toast.add({ severity: 'success', summary: 'Welcome!', detail: `Hello, ${response.firstName}` });
        this.router.navigate([APP_ROUTES.employees.list]);
      })
    ),
  { dispatch: false });

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.logout),
      tap(() => {
        this.storage.clear();
        this.router.navigate([APP_ROUTES.auth.login]);
      })
    ),
  { dispatch: false });
}
