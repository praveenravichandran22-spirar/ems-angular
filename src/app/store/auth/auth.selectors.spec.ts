import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsReviewer,
  selectIsApprover,
  selectFullName,
  selectCurrentUserEmail,
  selectUserRole,
} from './auth.selectors';
import { AuthUser } from '../../core/models/auth.model';

function state(overrides: Partial<{ user: AuthUser | null; accessToken: string | null }> = {}) {
  return {
    auth: {
      user:         null,
      accessToken:  null,
      refreshToken: null,
      loading:      false,
      error:        null,
      ...overrides,
    },
  };
}

const adminUser: AuthUser = { email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'ROLE_ADMIN' };
const reviewerUser: AuthUser = { email: 'rev@test.com', firstName: 'Rev', lastName: 'User', role: 'ROLE_REVIEWER' };
const approverUser: AuthUser = { email: 'apr@test.com', firstName: 'Apr', lastName: 'User', role: 'ROLE_APPROVER' };

describe('AuthSelectors', () => {
  describe('selectIsAuthenticated', () => {
    it('is false when no access token', () => {
      expect(selectIsAuthenticated(state())).toBe(false);
    });

    it('is true when access token present', () => {
      expect(selectIsAuthenticated(state({ accessToken: 'tok' }))).toBe(true);
    });
  });

  describe('selectIsAdmin', () => {
    it('is true for ROLE_ADMIN', () => {
      expect(selectIsAdmin(state({ user: adminUser }))).toBe(true);
    });

    it('is false for ROLE_REVIEWER', () => {
      expect(selectIsAdmin(state({ user: reviewerUser }))).toBe(false);
    });

    it('is false when no user', () => {
      expect(selectIsAdmin(state())).toBe(false);
    });
  });

  describe('selectIsReviewer', () => {
    it('is true for ROLE_REVIEWER', () => {
      expect(selectIsReviewer(state({ user: reviewerUser }))).toBe(true);
    });

    it('is false for ROLE_ADMIN', () => {
      expect(selectIsReviewer(state({ user: adminUser }))).toBe(false);
    });
  });

  describe('selectIsApprover', () => {
    it('is true for ROLE_APPROVER', () => {
      expect(selectIsApprover(state({ user: approverUser }))).toBe(true);
    });

    it('is false for ROLE_ADMIN', () => {
      expect(selectIsApprover(state({ user: adminUser }))).toBe(false);
    });
  });

  describe('selectFullName', () => {
    it('returns full name when user exists', () => {
      expect(selectFullName(state({ user: adminUser }))).toBe('Admin User');
    });

    it('returns empty string when no user', () => {
      expect(selectFullName(state())).toBe('');
    });
  });

  describe('selectCurrentUserEmail', () => {
    it('returns email when user exists', () => {
      expect(selectCurrentUserEmail(state({ user: adminUser }))).toBe('admin@test.com');
    });

    it('returns null when no user', () => {
      expect(selectCurrentUserEmail(state())).toBeNull();
    });
  });

  describe('selectUserRole', () => {
    it('returns role when user exists', () => {
      expect(selectUserRole(state({ user: reviewerUser }))).toBe('ROLE_REVIEWER');
    });

    it('returns null when no user', () => {
      expect(selectUserRole(state())).toBeNull();
    });
  });
});
