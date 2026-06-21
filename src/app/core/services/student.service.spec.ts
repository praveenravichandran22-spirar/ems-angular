import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { API_ROUTES } from '../constants/api.constants';
import { Student, PagedResponse } from '../models/student.model';
import { PagedResponse as EmpPagedResponse } from '../models/employee.model';

const mockStudent: Student = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Brown',
  email: 'alice@student.com',
  enrollmentNumber: 'EN001',
  course: 'Computer Science',
} as unknown as Student;

const mockPage: EmpPagedResponse<Student> = {
  content: [mockStudent],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 10,
  last: true,
};

describe('StudentService', () => {
  let service: StudentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('search sends GET with all optional params', () => {
    service.search({ page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc', keyword: 'alice', course: 'CS', year: 2, gender: 'FEMALE' }).subscribe();
    const req = http.expectOne(r => r.url === API_ROUTES.students.search);
    expect(req.request.params.get('keyword')).toBe('alice');
    expect(req.request.params.get('course')).toBe('CS');
    expect(req.request.params.get('year')).toBe('2');
    expect(req.request.params.get('gender')).toBe('FEMALE');
    req.flush(mockPage);
  });

  it('search omits optional params when absent', () => {
    service.search({ page: 0, size: 10, sortBy: 'id', sortDir: 'asc' }).subscribe();
    const req = http.expectOne(r => r.url === API_ROUTES.students.search);
    expect(req.request.params.has('keyword')).toBe(false);
    expect(req.request.params.has('course')).toBe(false);
    req.flush(mockPage);
  });

  it('getById sends GET', () => {
    service.getById(1).subscribe();
    const req = http.expectOne(API_ROUTES.students.byId(1));
    expect(req.request.method).toBe('GET');
    req.flush(mockStudent);
  });

  it('create sends POST', () => {
    service.create({ firstName: 'Alice' } as any).subscribe();
    const req = http.expectOne(API_ROUTES.students.base);
    expect(req.request.method).toBe('POST');
    req.flush(mockStudent);
  });

  it('update sends PUT', () => {
    service.update(1, { firstName: 'Alice Updated' } as any).subscribe();
    const req = http.expectOne(API_ROUTES.students.byId(1));
    expect(req.request.method).toBe('PUT');
    req.flush(mockStudent);
  });

  it('delete sends DELETE', () => {
    service.delete(1).subscribe();
    const req = http.expectOne(API_ROUTES.students.byId(1));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('uploadProfileImage sends POST with FormData', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    service.uploadProfileImage(1, file).subscribe();
    const req = http.expectOne(API_ROUTES.students.profileImage(1));
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockStudent);
  });
});
