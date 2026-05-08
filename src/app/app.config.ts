import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { MessageService, ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Store } from '@ngrx/store';

import { routes } from './app.routes';
import { authInterceptor }    from './core/interceptors/auth.interceptor';
import { errorInterceptor }   from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { authFeature }        from './store/auth/auth.reducer';
import { AuthEffects }        from './store/auth/auth.effects';
import { AuthStorageService } from './core/services/auth-storage.service';
import { authActions }        from './store/auth/auth.actions';
import { employeeFeature }    from './store/employee/employee.reducer';
import { EmployeeEffects }    from './store/employee/employee.effects';
import { studentFeature }     from './store/student/student.reducer';
import { StudentEffects }     from './store/student/student.effects';
import { lookupFeature }      from './store/lookup/lookup.reducer';
import { LookupEffects }      from './store/lookup/lookup.effects';
import { lookupActions }      from './store/lookup/lookup.actions';

function initApp(storage: AuthStorageService, store: Store) {
  return () => {
    const user         = storage.getUser();
    const accessToken  = storage.getAccessToken();
    const refreshToken = storage.getRefreshToken();
    if (user && accessToken && refreshToken) {
      store.dispatch(authActions.restoreSession({ user, accessToken, refreshToken }));
    }
    store.dispatch(lookupActions.load());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),

    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])
    ),

    provideStore({
      [authFeature.name]:     authFeature.reducer,
      [employeeFeature.name]: employeeFeature.reducer,
      [studentFeature.name]:  studentFeature.reducer,
      [lookupFeature.name]:   lookupFeature.reducer,
    }),
    provideEffects([AuthEffects, EmployeeEffects, StudentEffects, LookupEffects]),

    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.dark-mode' } },
      ripple: true,
    }),

    MessageService,
    ConfirmationService,

    {
      provide:    APP_INITIALIZER,
      useFactory: initApp,
      deps:       [AuthStorageService, Store],
      multi:      true,
    },
  ],
};
