import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api.constants';
import { Student, StudentRequest, StudentSearchParams } from '../models/student.model';
import { PagedResponse } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);

  search(params: StudentSearchParams): Observable<PagedResponse<Student>> {
    let p = new HttpParams()
      .set('page',    params.page.toString())
      .set('size',    params.size.toString())
      .set('sortBy',  params.sortBy)
      .set('sortDir', params.sortDir);
    if (params.keyword) p = p.set('keyword', params.keyword);
    if (params.course)  p = p.set('course',  params.course);
    if (params.year)    p = p.set('year',    params.year.toString());
    if (params.gender)  p = p.set('gender',  params.gender);
    return this.http.get<PagedResponse<Student>>(API_ROUTES.students.search, { params: p });
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(API_ROUTES.students.byId(id));
  }

  create(data: StudentRequest): Observable<Student> {
    return this.http.post<Student>(API_ROUTES.students.base, data);
  }

  update(id: number, data: StudentRequest): Observable<Student> {
    return this.http.put<Student>(API_ROUTES.students.byId(id), data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ROUTES.students.byId(id));
  }

  uploadProfileImage(id: number, file: File): Observable<Student> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Student>(API_ROUTES.students.profileImage(id), form);
  }
}