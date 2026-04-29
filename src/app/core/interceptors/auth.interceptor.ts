import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs';
import { selectAccessToken } from '../../store/auth/auth.selectors';
import { BEARER_PREFIX, TOKEN_HEADER } from '../constants/app.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: { [TOKEN_HEADER]: `${BEARER_PREFIX}${token}` },
        });
      }
      return next(req);
    })
  );
};
