import { Injectable } from '@angular/core';
import { AuthUser } from '../models/auth.model';
import { STORAGE_KEYS } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.accessToken,  accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }

  saveUser(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  }

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }
}
