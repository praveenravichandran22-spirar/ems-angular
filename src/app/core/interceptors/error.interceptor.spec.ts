import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockStore: { dispatch: jest.Mock };
  let mockRouter: { navigate: jest.Mock };
  let mockToast: { add: jest.Mock };

  beforeEach(() => {
    mockStore = { dispatch: jest.fn() };
    mockRouter = { navigate: jest.fn() };
    mockToast = { add: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockToast },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('dispatches logout and navigates to login on 401', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['auth/login']);
  });

  it('shows Access Denied toast on 403', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Access Denied' })
    );
  });

  it('shows Not Found toast with server message on 404', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({ error: 'Employee not found' }, { status: 404, statusText: 'Not Found' });
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn', summary: 'Not Found', detail: 'Employee not found' })
    );
  });

  it('shows Not Found toast with default message when no server message', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: 404, statusText: 'Not Found' });
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn', detail: 'Resource not found.' })
    );
  });

  it('shows generic error toast on 500', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({ error: 'Internal error' }, { status: 500, statusText: 'Server Error' });
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Error', detail: 'Internal error' })
    );
  });

  it('shows default error message when no server error message on 500', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: 500, statusText: 'Server Error' });
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'An unexpected error occurred.' })
    );
  });
});
