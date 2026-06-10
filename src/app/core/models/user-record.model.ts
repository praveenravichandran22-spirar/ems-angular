import { AppRole } from './auth.model';

export interface UserRecord {
  id:        number;
  firstName: string;
  lastName:  string;
  email:     string;
  role:      AppRole;
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

export interface CreateUserRequest {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  role:      'ROLE_REVIEWER' | 'ROLE_APPROVER';
}

export interface UpdateUserRequest {
  firstName: string;
  lastName:  string;
  role:      'ROLE_REVIEWER' | 'ROLE_APPROVER';
  password?: string; // optional — only sent when non-blank
}
