import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { TOKEN_HEADER, BEARER_PREFIX } from '../constants/app.constants';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function configure(token: string | null) {
    const mockStore = { select: jest.fn().mockReturnValue(of(token)), dispatch: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Store, useValue: mockStore },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpMock.verify());

  it('attaches Authorization header when token is present', () => {
    configure('my-access-token');
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get(TOKEN_HEADER)).toBe(`${BEARER_PREFIX}my-access-token`);
    req.flush({});
  });

  it('does not attach Authorization header when token is null', () => {
    configure(null);
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has(TOKEN_HEADER)).toBe(false);
    req.flush({});
  });
});
