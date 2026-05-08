export const API_BASE_URL    = 'http://localhost:8080/api';
export const BACKEND_ORIGIN  = 'http://localhost:8080';

export function resolveFileUrl(relativeUrl: string | null | undefined): string | null {
  if (!relativeUrl) return null;
  return `${BACKEND_ORIGIN}${relativeUrl}`;
}

export const API_ROUTES = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login:    `${API_BASE_URL}/auth/login`,
    refresh:  `${API_BASE_URL}/auth/refresh`,
    logout:   `${API_BASE_URL}/auth/logout`,
  },
  employees: {
    base:        `${API_BASE_URL}/employees`,
    byId:        (id: number) => `${API_BASE_URL}/employees/${id}`,
    search:      `${API_BASE_URL}/employees/search`,
    profileImage:(id: number) => `${API_BASE_URL}/employees/${id}/profile-image`,
    resume:      (id: number) => `${API_BASE_URL}/employees/${id}/resume`,
  },
  students: {
    base:        `${API_BASE_URL}/students`,
    byId:        (id: number) => `${API_BASE_URL}/students/${id}`,
    search:      `${API_BASE_URL}/students/search`,
    profileImage:(id: number) => `${API_BASE_URL}/students/${id}/profile-image`,
  },
  departments: {
    base: `${API_BASE_URL}/departments`,
    byId: (id: number) => `${API_BASE_URL}/departments/${id}`,
  },
  statuses: {
    base: `${API_BASE_URL}/statuses`,
    byId: (id: number) => `${API_BASE_URL}/statuses/${id}`,
  },
  countries: {
    base: `${API_BASE_URL}/countries`,
    byId: (id: number) => `${API_BASE_URL}/countries/${id}`,
  },
  enums: {
    genders: `${API_BASE_URL}/enums/genders`,
  },
  files: {
    url: (path: string) => `${API_BASE_URL.replace('/api', '')}/api/files/${path}`,
  },
} as const;
