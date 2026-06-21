import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserManagementService } from './user-management.service';
import { API_BASE_URL } from '../constants/api.constants';

const BASE = `${API_BASE_URL}/users`;

const mockUser = { id: 1, firstName: 'Test', lastName: 'User', email: 'test@test.com', role: 'ROLE_REVIEWER' };

describe('UserManagementService', () => {
  let service: UserManagementService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserManagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('search sends GET with all params', () => {
    service.search({ page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc', keyword: 'test', role: 'ROLE_REVIEWER' }).subscribe();
    const req = http.expectOne(r => r.url === BASE);
    expect(req.request.params.get('keyword')).toBe('test');
    expect(req.request.params.get('role')).toBe('ROLE_REVIEWER');
    req.flush({ content: [mockUser], totalElements: 1, totalPages: 1, page: 0, size: 10, last: true });
  });

  it('search omits optional params when absent', () => {
    service.search({ page: 0, size: 10, sortBy: 'id', sortDir: 'asc' }).subscribe();
    const req = http.expectOne(r => r.url === BASE);
    expect(req.request.params.has('keyword')).toBe(false);
    expect(req.request.params.has('role')).toBe(false);
    req.flush({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10, last: true });
  });

  it('createUser sends POST', () => {
    service.createUser({ firstName: 'New', lastName: 'User', email: 'new@test.com', password: 'p', role: 'ROLE_REVIEWER' }).subscribe();
    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });

  it('updateUser sends PUT to correct URL', () => {
    service.updateUser(1, { firstName: 'Updated' } as any).subscribe();
    const req = http.expectOne(`${BASE}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockUser);
  });

  it('deleteUser sends DELETE to correct URL', () => {
    service.deleteUser(1).subscribe();
    const req = http.expectOne(`${BASE}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
