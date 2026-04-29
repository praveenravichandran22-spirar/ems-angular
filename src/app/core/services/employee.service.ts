import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api.constants';
import { Employee, EmployeeRequest, EmployeeSearchParams, PagedResponse } from '../models/employee.model';

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
}
