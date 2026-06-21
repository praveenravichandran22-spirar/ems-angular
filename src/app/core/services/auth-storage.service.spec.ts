import { TestBed } from '@angular/core/testing';
import { AuthStorageService } from './auth-storage.service';
import { STORAGE_KEYS } from '../constants/app.constants';
import { AuthUser } from '../models/auth.model';

describe('AuthStorageService', () => {
  let service: AuthStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStorageService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('saveTokens stores access and refresh token', () => {
    service.saveTokens('access123', 'refresh456');
    expect(localStorage.getItem(STORAGE_KEYS.accessToken)).toBe('access123');
    expect(localStorage.getItem(STORAGE_KEYS.refreshToken)).toBe('refresh456');
  });

  it('saveUser serializes user to localStorage', () => {
    const user: AuthUser = { email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'ROLE_ADMIN' };
    service.saveUser(user);
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? '')).toEqual(user);
  });

  it('getAccessToken returns stored token', () => {
    localStorage.setItem(STORAGE_KEYS.accessToken, 'tok');
    expect(service.getAccessToken()).toBe('tok');
  });

  it('getAccessToken returns null when not set', () => {
    expect(service.getAccessToken()).toBeNull();
  });

  it('getRefreshToken returns stored token', () => {
    localStorage.setItem(STORAGE_KEYS.refreshToken, 'ref');
    expect(service.getRefreshToken()).toBe('ref');
  });

  it('getRefreshToken returns null when not set', () => {
    expect(service.getRefreshToken()).toBeNull();
  });

  it('getUser deserializes stored user', () => {
    const user: AuthUser = { email: 'x@y.com', firstName: 'X', lastName: 'Y', role: 'ROLE_USER' };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    expect(service.getUser()).toEqual(user);
  });

  it('getUser returns null when not set', () => {
    expect(service.getUser()).toBeNull();
  });

  it('clear removes all storage keys', () => {
    service.saveTokens('a', 'b');
    service.saveUser({ email: 'e', firstName: 'F', lastName: 'L', role: 'ROLE_USER' });
    service.clear();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.getUser()).toBeNull();
  });
});
