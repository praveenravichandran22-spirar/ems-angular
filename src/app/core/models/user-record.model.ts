export interface UserRecord {
  id:        number;
  firstName: string;
  lastName:  string;
  email:     string;
  role:      'ROLE_ADMIN' | 'ROLE_USER';
  enabled:   boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchParams {
  keyword?: string;
  role?:    string;
  page:     number;
  size:     number;
  sortBy:   string;
  sortDir:  'asc' | 'desc';
}
