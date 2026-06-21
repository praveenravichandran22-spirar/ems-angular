import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { API_ROUTES } from '../constants/api.constants';
import { Employee, PagedResponse } from '../models/employee.model';

const mockEmployee: Employee = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  workflowStatus: 'DRAFT',
  assignedReviewers: [],
  assignedApprovers: [],
} as unknown as Employee;

const mockPage: PagedResponse<Employee> = {
  content: [mockEmployee],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 10,
  last: true,
};

describe('EmployeeService', () => {
  let service: EmployeeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('search sends GET with params', () => {
    service.search({ page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc', keyword: 'John' }).subscribe();
    const req = http.expectOne(r => r.url === API_ROUTES.employees.search);
    expect(req.request.params.get('keyword')).toBe('John');
    req.flush(mockPage);
  });

  it('search omits optional params when not provided', () => {
    service.search({ page: 0, size: 10, sortBy: 'id', sortDir: 'asc' }).subscribe();
    const req = http.expectOne(r => r.url === API_ROUTES.employees.search);
    expect(req.request.params.has('keyword')).toBe(false);
    req.flush(mockPage);
  });

  it('getById sends GET to correct URL', () => {
    service.getById(1).subscribe();
    const req = http.expectOne(API_ROUTES.employees.byId(1));
    expect(req.request.method).toBe('GET');
    req.flush(mockEmployee);
  });

  it('create sends POST to base URL', () => {
    service.create({ firstName: 'John' } as any).subscribe();
    const req = http.expectOne(API_ROUTES.employees.base);
    expect(req.request.method).toBe('POST');
    req.flush(mockEmployee);
  });

  it('update sends PUT to correct URL', () => {
    service.update(1, { firstName: 'Jane' } as any).subscribe();
    const req = http.expectOne(API_ROUTES.employees.byId(1));
    expect(req.request.method).toBe('PUT');
    req.flush(mockEmployee);
  });

  it('delete sends DELETE to correct URL', () => {
    service.delete(1).subscribe();
    const req = http.expectOne(API_ROUTES.employees.byId(1));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('uploadProfileImage sends POST with FormData', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    service.uploadProfileImage(1, file).subscribe();
    const req = http.expectOne(API_ROUTES.employees.profileImage(1));
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockEmployee);
  });

  it('uploadResume sends POST with FormData', () => {
    const file = new File(['data'], 'cv.pdf', { type: 'application/pdf' });
    service.uploadResume(1, file).subscribe();
    const req = http.expectOne(API_ROUTES.employees.resume(1));
    expect(req.request.method).toBe('POST');
    req.flush(mockEmployee);
  });

  it('removeProfileImage sends DELETE', () => {
    service.removeProfileImage(1).subscribe();
    const req = http.expectOne(API_ROUTES.employees.profileImage(1));
    expect(req.request.method).toBe('DELETE');
    req.flush(mockEmployee);
  });

  it('removeResume sends DELETE', () => {
    service.removeResume(1).subscribe();
    const req = http.expectOne(API_ROUTES.employees.resume(1));
    expect(req.request.method).toBe('DELETE');
    req.flush(mockEmployee);
  });

  it('assignWorkflow sends PUT', () => {
    service.assignWorkflow(1, { reviewerIds: [2], approverIds: [3] }).subscribe();
    const req = http.expectOne(API_ROUTES.employees.assignWorkflow(1));
    expect(req.request.method).toBe('PUT');
    req.flush(mockEmployee);
  });

  it('submitForReview sends POST', () => {
    service.submitForReview(1).subscribe();
    const req = http.expectOne(API_ROUTES.employees.submit(1));
    expect(req.request.method).toBe('POST');
    req.flush(mockEmployee);
  });

  it('reviewEmployee sends POST', () => {
    service.reviewEmployee(1, { decision: 'APPROVE', note: 'OK' }).subscribe();
    const req = http.expectOne(API_ROUTES.employees.review(1));
    expect(req.request.method).toBe('POST');
    req.flush(mockEmployee);
  });

  it('approveEmployee sends POST', () => {
    service.approveEmployee(1, { decision: 'APPROVE', note: 'Approved' }).subscribe();
    const req = http.expectOne(API_ROUTES.employees.approve(1));
    expect(req.request.method).toBe('POST');
    req.flush(mockEmployee);
  });

  it('getWorkflowHistory sends GET', () => {
    service.getWorkflowHistory(1).subscribe();
    const req = http.expectOne(API_ROUTES.employees.workflowHistory(1));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getPendingReview sends GET', () => {
    service.getPendingReview().subscribe();
    const req = http.expectOne(API_ROUTES.employees.pendingReview);
    expect(req.request.method).toBe('GET');
    req.flush([mockEmployee]);
  });

  it('getPendingApproval sends GET', () => {
    service.getPendingApproval().subscribe();
    const req = http.expectOne(API_ROUTES.employees.pendingApproval);
    expect(req.request.method).toBe('GET');
    req.flush([mockEmployee]);
  });

  it('listReviewers sends GET', () => {
    service.listReviewers().subscribe();
    const req = http.expectOne(API_ROUTES.users.reviewers);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listApprovers sends GET', () => {
    service.listApprovers().subscribe();
    const req = http.expectOne(API_ROUTES.users.approvers);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
