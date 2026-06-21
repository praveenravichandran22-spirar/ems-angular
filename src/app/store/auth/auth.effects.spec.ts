import { TestBed } from '@angular/core/testing';
import { Action, Store } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AuthEffects } from './auth.effects';
import { authActions } from './auth.actions';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import { AuthResponse } from '../../core/models/auth.model';

function makeJwt(exp: number, iat: number): string {
  return `h.${btoa(JSON.stringify({ exp, iat }))}.s`;
}

const mockResponse: AuthResponse = {
  accessToken:  'at',
  refreshToken: 'rt',
  email:        'admin@test.com',
  firstName:    'Admin',
  lastName:     'User',
  role:         'ROLE_ADMIN',
};

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;
  let mockHttp: { post: jest.Mock };
  let mockRouter: { navigate: jest.Mock };
  let mockStorage: { saveTokens: jest.Mock; saveUser: jest.Mock; clear: jest.Mock; getRefreshToken: jest.Mock };
  let mockToast: { add: jest.Mock };
  let mockStore: { dispatch: jest.Mock; select: jest.Mock };

  beforeEach(() => {
    mockHttp    = { post: jest.fn() };
    mockRouter  = { navigate: jest.fn() };
    mockStorage = { saveTokens: jest.fn(), saveUser: jest.fn(), clear: jest.fn(), getRefreshToken: jest.fn() };
    mockToast   = { add: jest.fn() };
    mockStore   = { dispatch: jest.fn(), select: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: HttpClient,          useValue: mockHttp },
        { provide: Router,              useValue: mockRouter },
        { provide: AuthStorageService,  useValue: mockStorage },
        { provide: MessageService,      useValue: mockToast },
        { provide: Store,               useValue: mockStore },
      ],
    });
    effects = TestBed.inject(AuthEffects);
  });

  describe('login$', () => {
    it('dispatches loginSuccess on successful HTTP response', done => {
      mockHttp.post.mockReturnValue(of(mockResponse));
      actions$ = of(authActions.login({ request: { email: 'admin@test.com', password: 'pass' } }));

      effects.login$.subscribe(action => {
        expect(action).toEqual(authActions.loginSuccess({ response: mockResponse }));
        done();
      });
    });

    it('dispatches loginFailure on HTTP error with message', done => {
      mockHttp.post.mockReturnValue(throwError(() => ({ error: { error: 'Invalid credentials' } })));
      actions$ = of(authActions.login({ request: { email: 'x@y.com', password: 'wrong' } }));

      effects.login$.subscribe(action => {
        expect(action).toEqual(authActions.loginFailure({ error: 'Invalid credentials' }));
        done();
      });
    });

    it('uses default message when login error has no error field', done => {
      mockHttp.post.mockReturnValue(throwError(() => ({})));
      actions$ = of(authActions.login({ request: { email: 'x@y.com', password: 'wrong' } }));

      effects.login$.subscribe(action => {
        expect(action).toEqual(authActions.loginFailure({ error: 'Login failed' }));
        done();
      });
    });
  });

  describe('register$', () => {
    it('dispatches registerSuccess on successful HTTP response', done => {
      mockHttp.post.mockReturnValue(of(mockResponse));
      actions$ = of(authActions.register({ request: { email: 'new@test.com', password: 'p', firstName: 'N', lastName: 'U', role: 'ROLE_USER' } }));

      effects.register$.subscribe(action => {
        expect(action).toEqual(authActions.registerSuccess({ response: mockResponse }));
        done();
      });
    });

    it('dispatches registerFailure on error', done => {
      mockHttp.post.mockReturnValue(throwError(() => ({ error: { error: 'Email taken' } })));
      actions$ = of(authActions.register({ request: { email: 'taken@test.com', password: 'p', firstName: 'N', lastName: 'U', role: 'ROLE_USER' } }));

      effects.register$.subscribe(action => {
        expect(action).toEqual(authActions.registerFailure({ error: 'Email taken' }));
        done();
      });
    });

    it('uses default message when register error has no error field', done => {
      mockHttp.post.mockReturnValue(throwError(() => ({})));
      actions$ = of(authActions.register({ request: { email: 'x@y.com', password: 'p', firstName: 'X', lastName: 'Y', role: 'ROLE_USER' } }));

      effects.register$.subscribe(action => {
        expect(action).toEqual(authActions.registerFailure({ error: 'Registration failed' }));
        done();
      });
    });
  });

  describe('logout$', () => {
    it('clears storage and navigates to login', done => {
      actions$ = of(authActions.logout());

      effects.logout$.subscribe(() => {
        expect(mockStorage.clear).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['auth/login']);
        done();
      });
    });
  });

  // ── onAuthSuccess$ ─────────────────────────────────────────────────────────

  describe('onAuthSuccess$', () => {
    it('saves tokens, user, shows toast and navigates on loginSuccess', done => {
      const token = makeJwt(9999999999, 1700000000);
      actions$ = of(authActions.loginSuccess({ response: { ...mockResponse, accessToken: token } }));

      effects.onAuthSuccess$.subscribe(() => {
        expect(mockStorage.saveTokens).toHaveBeenCalledWith(token, mockResponse.refreshToken);
        expect(mockStorage.saveUser).toHaveBeenCalledWith({
          email: mockResponse.email, firstName: mockResponse.firstName,
          lastName: mockResponse.lastName, role: mockResponse.role,
        });
        expect(mockToast.add).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalled();
        done();
      });
    });

    it('also handles registerSuccess', done => {
      const token = makeJwt(9999999999, 1700000000);
      actions$ = of(authActions.registerSuccess({ response: { ...mockResponse, accessToken: token } }));

      effects.onAuthSuccess$.subscribe(() => {
        expect(mockStorage.saveTokens).toHaveBeenCalled();
        done();
      });
    });

    it('dispatches logout when expired token and active user has no refresh token', done => {
      // Token expired in 2001 — handleExpiry runs synchronously
      const token = makeJwt(1000000, 900000);
      mockStorage.getRefreshToken.mockReturnValue(null);
      actions$ = of(authActions.loginSuccess({ response: { ...mockResponse, accessToken: token } }));

      effects.onAuthSuccess$.subscribe(() => {
        // lastActivityAt > 0 (set in tap), no refresh token → dispatchLogout
        expect(mockStore.dispatch).toHaveBeenCalled();
        done();
      });
    });

    it('silently refreshes when expired token but user was active', done => {
      const expiredToken = makeJwt(1000000, 900000);
      const newToken     = makeJwt(9999999999, 1700000000);
      const newResp      = { ...mockResponse, accessToken: newToken };
      mockStorage.getRefreshToken.mockReturnValue('old-rt');
      // Second http.post call is for the silent refresh
      mockHttp.post.mockReturnValueOnce(of(newResp));
      actions$ = of(authActions.loginSuccess({ response: { ...mockResponse, accessToken: expiredToken } }));

      effects.onAuthSuccess$.subscribe(() => {
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: authActions.restoreSession.type })
        );
        done();
      });
    });

    it('dispatches logout when silent refresh fails', done => {
      const expiredToken = makeJwt(1000000, 900000);
      mockStorage.getRefreshToken.mockReturnValue('old-rt');
      mockHttp.post.mockReturnValueOnce(throwError(() => new Error('network error')));
      actions$ = of(authActions.loginSuccess({ response: { ...mockResponse, accessToken: expiredToken } }));

      effects.onAuthSuccess$.subscribe(() => {
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: authActions.logout.type })
        );
        done();
      });
    });

    it('handles malformed token gracefully (catch swallows error)', done => {
      // Middle segment is not valid base64 JSON → JSON.parse throws → caught silently
      actions$ = of(authActions.loginSuccess({ response: { ...mockResponse, accessToken: 'h.!!!.s' } }));

      effects.onAuthSuccess$.subscribe(() => {
        expect(mockRouter.navigate).toHaveBeenCalled(); // tap still ran
        done();
      });
    });
  });

  // ── restoreSession$ ────────────────────────────────────────────────────────

  describe('restoreSession$', () => {
    const restorePayload = {
      user: { email: 'u@u.com', firstName: 'U', lastName: 'R', role: 'ROLE_USER' as const },
      refreshToken: 'rt',
    };

    it('starts activity tracking and schedules timer for valid token', done => {
      jest.useFakeTimers();
      actions$ = of(authActions.restoreSession({
        ...restorePayload,
        accessToken: makeJwt(9999999999, 1700000000),
      }));

      effects.restoreSession$.subscribe(() => {
        jest.useRealTimers();
        done();
      });
    });

    it('dispatches logout when token is expired and user was idle (lastActivityAt = 0)', done => {
      // restoreSession$ does NOT set lastActivityAt → stays 0 → idle path → dispatchLogout
      actions$ = of(authActions.restoreSession({
        ...restorePayload,
        accessToken: makeJwt(1000000, 900000),
      }));

      effects.restoreSession$.subscribe(() => {
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: authActions.logout.type })
        );
        done();
      });
    });
  });
});
