import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { UserRecord, UserSearchParams } from '../models/user-record.model';
import { PagedResponse } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/users`;

  search(params: UserSearchParams): Observable<PagedResponse<UserRecord>> {
    let p = new HttpParams()
      .set('page',    params.page.toString())
      .set('size',    params.size.toString())
      .set('sortBy',  params.sortBy)
      .set('sortDir', params.sortDir);
    if (params.keyword) p = p.set('keyword', params.keyword);
    if (params.role)    p = p.set('role',    params.role);
    return this.http.get<PagedResponse<UserRecord>>(this.base, { params: p });
  }
}
