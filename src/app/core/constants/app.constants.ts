export const APP_ROUTES = {
  auth: {
    root:     'auth',
    login:    'auth/login',
    register: 'auth/register',
  },
  employees: {
    root:   'employees',
    list:   'employees',
    detail: (id: number | string) => `employees/${id}`,
    create: 'employees/new',
    edit:   (id: number | string) => `employees/${id}/edit`,
  },
  admin: {
    departments: 'admin/departments',
    statuses:    'admin/statuses',
  },
} as const;

export const STORAGE_KEYS = {
  accessToken:  'ems_access_token',
  refreshToken: 'ems_refresh_token',
  user:         'ems_user',
} as const;

export const PAGINATION_DEFAULTS = {
  page:    0,
  size:    10,
  sortBy:  'id',
  sortDir: 'asc',
} as const;

export const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

export const ROLES = {
  admin: 'ROLE_ADMIN',
  user:  'ROLE_USER',
} as const;

export const TOKEN_HEADER = 'Authorization';
export const BEARER_PREFIX = 'Bearer ';
