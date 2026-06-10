import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectIsAdmin, selectIsReviewer, selectIsApprover } from '../../store/auth/auth.selectors';
import { APP_ROUTES } from '../constants/app.constants';

export const adminGuard: CanActivateFn = () => {
  const store  = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAdmin).pipe(
    take(1),
    map(isAdmin => isAdmin || router.createUrlTree([APP_ROUTES.unauthorized]))
  );
};

export const reviewerGuard: CanActivateFn = () => {
  const store  = inject(Store);
  const router = inject(Router);

  return store.select(selectIsReviewer).pipe(
    take(1),
    map(isReviewer => isReviewer || router.createUrlTree([APP_ROUTES.unauthorized]))
  );
};

export const approverGuard: CanActivateFn = () => {
  const store  = inject(Store);
  const router = inject(Router);

  return store.select(selectIsApprover).pipe(
    take(1),
    map(isApprover => isApprover || router.createUrlTree([APP_ROUTES.unauthorized]))
  );
};
