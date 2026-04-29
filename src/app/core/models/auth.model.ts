export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  role:      'ROLE_ADMIN' | 'ROLE_USER';
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  email:        string;
  firstName:    string;
  lastName:     string;
  role:         'ROLE_ADMIN' | 'ROLE_USER';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
  email:     string;
  firstName: string;
  lastName:  string;
  role:      'ROLE_ADMIN' | 'ROLE_USER';
}
