import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SimEmployeeService } from './sim-employee.service';
import { API_BASE_URL } from '../constants/api.constants';

const SEARCH_URL = `${API_BASE_URL}/sim-employees/search`;

describe('SimEmployeeService', () => {
  let service: SimEmployeeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SimEmployeeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('search sends GET with all optional params', () => {
    service.search({ page: 0, size: 10, sortBy: 'id', sortDir: 'asc', keyword: 'john', department: 'HR', status: 'Active' }).subscribe();
    const req = http.expectOne(r => r.url === SEARCH_URL);
    expect(req.request.params.get('keyword')).toBe('john');
    expect(req.request.params.get('department')).toBe('HR');
    expect(req.request.params.get('status')).toBe('Active');
    req.flush({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10, last: true });
  });

  it('search omits optional params when absent', () => {
    service.search({ page: 0, size: 10, sortBy: 'id', sortDir: 'asc' }).subscribe();
    const req = http.expectOne(r => r.url === SEARCH_URL);
    expect(req.request.params.has('keyword')).toBe(false);
    expect(req.request.params.has('department')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    req.flush({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10, last: true });
  });

  it('search includes base pagination params', () => {
    service.search({ page: 2, size: 25, sortBy: 'name', sortDir: 'desc' }).subscribe();
    const req = http.expectOne(r => r.url === SEARCH_URL);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('25');
    expect(req.request.params.get('sortBy')).toBe('name');
    expect(req.request.params.get('sortDir')).toBe('desc');
    req.flush({ content: [], totalElements: 0, totalPages: 0, page: 2, size: 25, last: true });
  });
});
