import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api.constants';
import {
  AssignWorkflowRequest,
  Employee,
  EmployeeRequest,
  EmployeeSearchParams,
  PagedResponse,
  WorkflowAction,
  WorkflowUser,
} from '../models/employee.model';
import { WorkflowDecisionRequest } from '../models/workflow.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  search(params: EmployeeSearchParams): Observable<PagedResponse<Employee>> {
    let p = new HttpParams()
      .set('page',    params.page.toString())
      .set('size',    params.size.toString())
      .set('sortBy',  params.sortBy)
      .set('sortDir', params.sortDir);
    if (params.keyword)      p = p.set('keyword',      params.keyword);
    if (params.departmentId) p = p.set('departmentId', params.departmentId.toString());
    if (params.statusId)     p = p.set('statusId',     params.statusId.toString());
    return this.http.get<PagedResponse<Employee>>(API_ROUTES.employees.search, { params: p });
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(API_ROUTES.employees.byId(id));
  }

  create(data: EmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(API_ROUTES.employees.base, data);
  }

  update(id: number, data: EmployeeRequest): Observable<Employee> {
    return this.http.put<Employee>(API_ROUTES.employees.byId(id), data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ROUTES.employees.byId(id));
  }

  uploadProfileImage(id: number, file: File): Observable<Employee> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Employee>(API_ROUTES.employees.profileImage(id), form);
  }

  uploadResume(id: number, file: File): Observable<Employee> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Employee>(API_ROUTES.employees.resume(id), form);
  }

  removeProfileImage(id: number): Observable<Employee> {
    return this.http.delete<Employee>(API_ROUTES.employees.profileImage(id));
  }

  removeResume(id: number): Observable<Employee> {
    return this.http.delete<Employee>(API_ROUTES.employees.resume(id));
  }

  // ── Workflow ──────────────────────────────────────────────────────────────

  assignWorkflow(id: number, request: AssignWorkflowRequest): Observable<Employee> {
    return this.http.put<Employee>(API_ROUTES.employees.assignWorkflow(id), request);
  }

  submitForReview(id: number): Observable<Employee> {
    return this.http.post<Employee>(API_ROUTES.employees.submit(id), {});
  }

  reviewEmployee(id: number, request: WorkflowDecisionRequest): Observable<Employee> {
    return this.http.post<Employee>(API_ROUTES.employees.review(id), request);
  }

  approveEmployee(id: number, request: WorkflowDecisionRequest): Observable<Employee> {
    return this.http.post<Employee>(API_ROUTES.employees.approve(id), request);
  }

  getWorkflowHistory(id: number): Observable<WorkflowAction[]> {
    return this.http.get<WorkflowAction[]>(API_ROUTES.employees.workflowHistory(id));
  }

  getPendingReview(): Observable<Employee[]> {
    return this.http.get<Employee[]>(API_ROUTES.employees.pendingReview);
  }

  getPendingApproval(): Observable<Employee[]> {
    return this.http.get<Employee[]>(API_ROUTES.employees.pendingApproval);
  }

  // ── User lists (for workflow dropdowns) ───────────────────────────────────

  listReviewers(): Observable<WorkflowUser[]> {
    return this.http.get<WorkflowUser[]>(API_ROUTES.users.reviewers);
  }

  listApprovers(): Observable<WorkflowUser[]> {
    return this.http.get<WorkflowUser[]>(API_ROUTES.users.approvers);
  }
}
