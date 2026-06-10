import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, debounceTime, fromEvent, map, merge, of, Subscription, switchMap, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
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
  private readonly store    = inject(Store);

  private tokenTimer:    ReturnType<typeof setTimeout> | null = null;
  private activitySub:   Subscription | null = null;
  // 0 = unknown (treated as idle). Only updated by real user events.
  private lastActivityAt = 0;

  // ── Auth actions ───────────────────────────────────────────────────────────

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
        // Fresh login counts as activity
        this.lastActivityAt = Date.now();
        this.startActivityTracking();
        this.scheduleTokenExpiry(response.accessToken);
      })
    ),
  { dispatch: false });

  // On page refresh: restore session but do NOT mark as active —
  // lastActivityAt stays 0 so user is treated as idle until they interact.
  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.restoreSession),
      tap(({ accessToken }) => {
        this.startActivityTracking();
        this.scheduleTokenExpiry(accessToken);
      })
    ),
  { dispatch: false });

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.logout),
      tap(() => {
        if (this.tokenTimer) { clearTimeout(this.tokenTimer); this.tokenTimer = null; }
        this.activitySub?.unsubscribe();
        this.activitySub   = null;
        this.lastActivityAt = 0;
        this.storage.clear();
        this.router.navigate([APP_ROUTES.auth.login]);
      })
    ),
  { dispatch: false });

  // ── Helpers ────────────────────────────────────────────────────────────────

  private startActivityTracking(): void {
    this.activitySub?.unsubscribe();
    // Do NOT reset lastActivityAt here — only real user events update it.
    this.activitySub = merge(
      fromEvent(document, 'click'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'scroll'),
    ).pipe(debounceTime(500))
     .subscribe(() => { this.lastActivityAt = Date.now(); });
  }

  private scheduleTokenExpiry(accessToken: string): void {
    if (this.tokenTimer) clearTimeout(this.tokenTimer);
    try {
      const payload        = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresIn      = payload.exp * 1000 - Date.now();
      const tokenDurationMs = (payload.exp - payload.iat) * 1000;
      if (expiresIn <= 0) { this.handleExpiry(tokenDurationMs); return; }
      this.tokenTimer = setTimeout(() => this.handleExpiry(tokenDurationMs), expiresIn);
    } catch {
      // malformed token — 401 interceptor handles it
    }
  }

  private handleExpiry(tokenDurationMs: number): void {
    const idleMs = Date.now() - this.lastActivityAt;

    if (this.lastActivityAt > 0 && idleMs < tokenDurationMs) {
      // User was active during this token's lifetime — silently refresh
      const refreshToken = this.storage.getRefreshToken();
      if (!refreshToken) { this.dispatchLogout(); return; }

      this.http.post<AuthResponse>(API_ROUTES.auth.refresh, { refreshToken }).subscribe({
        next: response => {
          this.storage.saveTokens(response.accessToken, response.refreshToken);
          this.storage.saveUser({
            email: response.email, firstName: response.firstName,
            lastName: response.lastName, role: response.role,
          });
          // Dispatch restoreSession so the store has the new token.
          // restoreSession$ will reschedule the expiry timer.
          this.store.dispatch(authActions.restoreSession({
            user:         { email: response.email, firstName: response.firstName, lastName: response.lastName, role: response.role },
            accessToken:  response.accessToken,
            refreshToken: response.refreshToken,
          }));
        },
        error: () => this.dispatchLogout(),
      });
    } else {
      // lastActivityAt is 0 (unknown) or user was idle longer than token lifetime
      this.dispatchLogout();
    }
  }

  private dispatchLogout(): void {
    this.toast.add({
      severity: 'warn',
      summary:  'Session Expired',
      detail:   'You have been logged out due to inactivity.',
      life:     4000,
    });
    this.store.dispatch(authActions.logout());
  }
}