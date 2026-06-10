import { createSelector } from '@ngrx/store';
import { authFeature } from './auth.reducer';
import { ROLES } from '../../core/constants/app.constants';

export const {
  selectUser,
  selectAccessToken,
  selectRefreshToken,
  selectLoading: selectAuthLoading,
  selectError:   selectAuthError,
} = authFeature;

export const selectIsAuthenticated = createSelector(
  selectAccessToken,
  token => !!token
);

export const selectUserRole = createSelector(
  selectUser,
  user => user?.role ?? null
);

export const selectIsAdmin = createSelector(
  selectUser,
  user => user?.role === ROLES.admin
);

export const selectIsReviewer = createSelector(
  selectUser,
  user => user?.role === ROLES.reviewer
);

export const selectIsApprover = createSelector(
  selectUser,
  user => user?.role === ROLES.approver
);

export const selectFullName = createSelector(
  selectUser,
  user => user ? `${user.firstName} ${user.lastName}` : ''
);

export const selectCurrentUserEmail = createSelector(
  selectUser,
  user => user?.email ?? null
);
