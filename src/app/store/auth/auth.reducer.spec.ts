import { authFeature } from './auth.reducer';
import { authActions } from './auth.actions';
import { AuthResponse, AuthUser } from '../../core/models/auth.model';

const reducer = authFeature.reducer;

const mockResponse: AuthResponse = {
  accessToken:  'access-token',
  refreshToken: 'refresh-token',
  email:        'admin@test.com',
  firstName:    'Admin',
  lastName:     'User',
  role:         'ROLE_ADMIN',
};

describe('AuthReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = reducer(undefined, { type: '@@INIT' } as any);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login sets loading true and clears error', () => {
    const state = reducer(undefined, authActions.login({ request: { email: 'a@b.com', password: 'p' } }));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('register sets loading true', () => {
    const state = reducer(
      undefined,
      authActions.register({ request: { email: 'a@b.com', password: 'p', firstName: 'A', lastName: 'B', role: 'ROLE_USER' } })
    );
    expect(state.loading).toBe(true);
  });

  it('loginSuccess stores tokens and user', () => {
    const state = reducer(undefined, authActions.loginSuccess({ response: mockResponse }));
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user?.email).toBe('admin@test.com');
    expect(state.user?.role).toBe('ROLE_ADMIN');
    expect(state.loading).toBe(false);
  });

  it('registerSuccess stores tokens and user', () => {
    const state = reducer(undefined, authActions.registerSuccess({ response: mockResponse }));
    expect(state.accessToken).toBe('access-token');
    expect(state.user?.firstName).toBe('Admin');
  });

  it('loginFailure stores error and clears loading', () => {
    const state = reducer(undefined, authActions.loginFailure({ error: 'Bad credentials' }));
    expect(state.error).toBe('Bad credentials');
    expect(state.loading).toBe(false);
  });

  it('registerFailure stores error', () => {
    const state = reducer(undefined, authActions.registerFailure({ error: 'Email taken' }));
    expect(state.error).toBe('Email taken');
    expect(state.loading).toBe(false);
  });

  it('logout resets to initial state', () => {
    const loggedIn = reducer(undefined, authActions.loginSuccess({ response: mockResponse }));
    const state = reducer(loggedIn, authActions.logout());
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('restoreSession sets user and tokens without touching loading', () => {
    const user: AuthUser = { email: 'r@test.com', firstName: 'R', lastName: 'U', role: 'ROLE_REVIEWER' };
    const state = reducer(undefined, authActions.restoreSession({ user, accessToken: 'at', refreshToken: 'rt' }));
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe('at');
    expect(state.refreshToken).toBe('rt');
  });
});
