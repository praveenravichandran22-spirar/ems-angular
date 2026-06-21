import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LookupService } from './lookup.service';
import { API_ROUTES } from '../constants/api.constants';

describe('LookupService', () => {
  let service: LookupService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LookupService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getDepartments sends GET to departments base URL', () => {
    service.getDepartments().subscribe(result => {
      expect(result).toEqual([{ id: 1, name: 'HR' }]);
    });
    http.expectOne(API_ROUTES.departments.base).flush([{ id: 1, name: 'HR' }]);
  });

  it('getStatuses sends GET to statuses base URL', () => {
    service.getStatuses().subscribe(result => {
      expect(result).toEqual([{ id: 1, name: 'Active' }]);
    });
    http.expectOne(API_ROUTES.statuses.base).flush([{ id: 1, name: 'Active' }]);
  });

  it('getCountries sends GET to countries base URL', () => {
    service.getCountries().subscribe(result => {
      expect(result).toEqual([{ id: 1, countryName: 'India' }]);
    });
    http.expectOne(API_ROUTES.countries.base).flush([{ id: 1, countryName: 'India' }]);
  });
});
