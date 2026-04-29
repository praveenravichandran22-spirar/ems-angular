import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthUser } from '../../core/models/auth.model';
import { authActions } from './auth.actions';

interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  refreshToken: string | null;
  loading:      boolean;
  error:        string | null;
}

const initialState: AuthState = {
  user:         null,
  accessToken:  null,
  refreshToken: null,
  loading:      false,
  error:        null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,

    on(authActions.login, authActions.register, state => ({
      ...state, loading: true, error: null,
    })),

    on(authActions.loginSuccess, authActions.registerSuccess, (state, { response }) => ({
      ...state,
      loading:      false,
      accessToken:  response.accessToken,
      refreshToken: response.refreshToken,
      user: {
        email:     response.email,
        firstName: response.firstName,
        lastName:  response.lastName,
        role:      response.role,
      },
    })),

    on(authActions.loginFailure, authActions.registerFailure, (state, { error }) => ({
      ...state, loading: false, error,
    })),

    on(authActions.logout, () => initialState),

    on(authActions.restoreSession, (state, { user, accessToken, refreshToken }) => ({
      ...state, user, accessToken, refreshToken,
    })),
  ),
});
