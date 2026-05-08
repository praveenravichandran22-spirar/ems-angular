import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api.constants';
import { Department } from '../models/department.model';
import { EmploymentStatus } from '../models/status.model';
import { Country } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(API_ROUTES.departments.base);
  }

  getStatuses(): Observable<EmploymentStatus[]> {
    return this.http.get<EmploymentStatus[]>(API_ROUTES.statuses.base);
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(API_ROUTES.countries.base);
  }
}
