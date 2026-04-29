import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { SimEmployee, SimSearchParams } from '../models/sim-employee.model';
import { PagedResponse } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class SimEmployeeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/sim-employees`;

  search(params: SimSearchParams): Observable<PagedResponse<SimEmployee>> {
    let p = new HttpParams()
      .set('page',    params.page.toString())
      .set('size',    params.size.toString())
      .set('sortBy',  params.sortBy)
      .set('sortDir', params.sortDir);
    if (params.keyword)    p = p.set('keyword',    params.keyword);
    if (params.department) p = p.set('department', params.department);
    if (params.status)     p = p.set('status',     params.status);
    return this.http.get<PagedResponse<SimEmployee>>(`${this.base}/search`, { params: p });
  }
}
