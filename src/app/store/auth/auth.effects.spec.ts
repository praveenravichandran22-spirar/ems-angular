import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { AuthEffects } from './auth.effects';
import { authActions } from './auth.actions';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import { AuthResponse } from '../../core/models/auth.model';

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
});
