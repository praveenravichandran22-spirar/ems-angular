import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { adminGuard, reviewerGuard, approverGuard } from './role.guard';

function setup(selectValue: boolean) {
  const mockStore = { select: jest.fn().mockReturnValue(of(selectValue)), dispatch: jest.fn() };
  const mockRouter = { createUrlTree: jest.fn().mockReturnValue({ urlTree: true }) };

  TestBed.configureTestingModule({
    providers: [
      { provide: Store, useValue: mockStore },
      { provide: Router, useValue: mockRouter },
    ],
  });
  return { mockRouter };
}

describe('adminGuard', () => {
  it('returns true for admin', done => {
    setup(true);
    TestBed.runInInjectionContext(() => {
      (adminGuard({} as any, {} as any) as any).subscribe((r: any) => {
        expect(r).toBe(true);
        done();
      });
    });
  });

  it('returns UrlTree for non-admin', done => {
    const { mockRouter } = setup(false);
    TestBed.runInInjectionContext(() => {
      (adminGuard({} as any, {} as any) as any).subscribe((r: any) => {
        expect(mockRouter.createUrlTree).toHaveBeenCalled();
        done();
      });
    });
  });
});

describe('reviewerGuard', () => {
  it('returns true for reviewer', done => {
    setup(true);
    TestBed.runInInjectionContext(() => {
      (reviewerGuard({} as any, {} as any) as any).subscribe((r: any) => {
        expect(r).toBe(true);
        done();
      });
    });
  });

  it('redirects for non-reviewer', done => {
    const { mockRouter } = setup(false);
    TestBed.runInInjectionContext(() => {
      (reviewerGuard({} as any, {} as any) as any).subscribe((r: any) => {
        expect(mockRouter.createUrlTree).toHaveBeenCalled();
        done();
      });
    });
  });
});

describe('approverGuard', () => {
  it('returns true for approver', done => {
    setup(true);
    TestBed.runInInjectionContext(() => {
      (approverGuard({} as any, {} as any) as any).subscribe((r: any) => {
        expect(r).toBe(true);
        done();
      });
    });
  });

  it('redirects for non-approver', done => {
    const { mockRouter } = setup(false);
    TestBed.runInInjectionContext(() => {
      (approverGuard({} as any, {} as any) as any).subscribe((r: any) => {
        expect(mockRouter.createUrlTree).toHaveBeenCalled();
        done();
      });
    });
  });
});
