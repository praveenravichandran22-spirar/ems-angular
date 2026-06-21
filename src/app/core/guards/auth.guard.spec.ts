import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let mockStore: { select: jest.Mock; dispatch: jest.Mock };
  let mockRouter: { createUrlTree: jest.Mock };

  beforeEach(() => {
    mockStore = { select: jest.fn(), dispatch: jest.fn() };
    mockRouter = { createUrlTree: jest.fn().mockReturnValue({ urlTree: true }) };

    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('returns true when authenticated', done => {
    mockStore.select.mockReturnValue(of(true));

    TestBed.runInInjectionContext(() => {
      (authGuard({} as any, {} as any) as any).subscribe((result: any) => {
        expect(result).toBe(true);
        done();
      });
    });
  });

  it('returns UrlTree redirect when not authenticated', done => {
    mockStore.select.mockReturnValue(of(false));

    TestBed.runInInjectionContext(() => {
      (authGuard({} as any, {} as any) as any).subscribe((result: any) => {
        expect(mockRouter.createUrlTree).toHaveBeenCalled();
        expect(result).toEqual({ urlTree: true });
        done();
      });
    });
  });
});
