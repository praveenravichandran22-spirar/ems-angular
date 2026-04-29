import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../../core/models/auth.model';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login':             props<{ request: LoginRequest }>(),
    'Login Success':     props<{ response: AuthResponse }>(),
    'Login Failure':     props<{ error: string }>(),

    'Register':          props<{ request: RegisterRequest }>(),
    'Register Success':  props<{ response: AuthResponse }>(),
    'Register Failure':  props<{ error: string }>(),

    'Logout':            emptyProps(),

    'Restore Session':   props<{ user: AuthUser; accessToken: string; refreshToken: string }>(),
  },
});
