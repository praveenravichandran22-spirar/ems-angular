import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => httpMock.verify());

  it('sets isLoading true while request is in-flight and false after', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/api/test').subscribe();
    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/api/test').flush({});
    expect(loadingService.isLoading()).toBe(false);
  });

  it('decrements loading counter on error', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    expect(loadingService.isLoading()).toBe(true);
    httpMock.expectOne('/api/test').flush({}, { status: 500, statusText: 'Error' });
    expect(loadingService.isLoading()).toBe(false);
  });
});
