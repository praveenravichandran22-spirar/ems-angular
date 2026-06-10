export interface LoginRequest {
  email:    string;
  password: string;
}

export type AppRole = 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_REVIEWER' | 'ROLE_APPROVER';

export interface RegisterRequest {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  role:      AppRole;
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  email:        string;
  firstName:    string;
  lastName:     string;
  role:         AppRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
  email:     string;
  firstName: string;
  lastName:  string;
  role:      AppRole;
}
