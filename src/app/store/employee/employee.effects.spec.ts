import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EmployeeEffects } from './employee.effects';
import { employeeActions } from './employee.actions';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee, PagedResponse } from '../../core/models/employee.model';

const mockEmployee = { id: 1, firstName: 'John' } as Employee;
const mockPage: PagedResponse<Employee> = { content: [mockEmployee], totalElements: 1, totalPages: 1, page: 0, size: 10, last: true };
const baseParams = { page: 0, size: 10, sortBy: 'firstName' as const, sortDir: 'asc' as const };

describe('EmployeeEffects', () => {
  let actions$: Observable<Action>;
  let effects: EmployeeEffects;
  let mockSvc: { search: jest.Mock; delete: jest.Mock };
  let mockToast: { add: jest.Mock };

  beforeEach(() => {
    mockSvc   = { search: jest.fn(), delete: jest.fn() };
    mockToast = { add: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        EmployeeEffects,
        provideMockActions(() => actions$),
        { provide: EmployeeService,  useValue: mockSvc },
        { provide: MessageService,   useValue: mockToast },
      ],
    });
    effects = TestBed.inject(EmployeeEffects);
  });

  describe('load$', () => {
    it('dispatches loadSuccess on success', done => {
      mockSvc.search.mockReturnValue(of(mockPage));
      actions$ = of(employeeActions.load({ params: baseParams }));
      effects.load$.subscribe(action => {
        expect(action).toEqual(employeeActions.loadSuccess({ data: mockPage }));
        done();
      });
    });

    it('dispatches loadFailure on error', done => {
      mockSvc.search.mockReturnValue(throwError(() => ({ message: 'Network error' })));
      actions$ = of(employeeActions.load({ params: baseParams }));
      effects.load$.subscribe(action => {
        expect(action).toEqual(employeeActions.loadFailure({ error: 'Network error' }));
        done();
      });
    });

    it('uses default message when error has no message', done => {
      mockSvc.search.mockReturnValue(throwError(() => ({})));
      actions$ = of(employeeActions.load({ params: baseParams }));
      effects.load$.subscribe(action => {
        expect(action).toEqual(employeeActions.loadFailure({ error: 'Failed to load employees' }));
        done();
      });
    });
  });

  describe('delete$', () => {
    it('dispatches deleteSuccess on success', done => {
      mockSvc.delete.mockReturnValue(of(undefined));
      actions$ = of(employeeActions.delete({ id: 1 }));
      effects.delete$.subscribe(action => {
        expect(action).toEqual(employeeActions.deleteSuccess({ id: 1 }));
        done();
      });
    });

    it('dispatches deleteFailure on error', done => {
      mockSvc.delete.mockReturnValue(throwError(() => ({ message: 'Delete failed' })));
      actions$ = of(employeeActions.delete({ id: 1 }));
      effects.delete$.subscribe(action => {
        expect(action).toEqual(employeeActions.deleteFailure({ error: 'Delete failed' }));
        done();
      });
    });

    it('uses default message when delete error has no message', done => {
      mockSvc.delete.mockReturnValue(throwError(() => ({})));
      actions$ = of(employeeActions.delete({ id: 1 }));
      effects.delete$.subscribe(action => {
        expect(action).toEqual(employeeActions.deleteFailure({ error: 'Delete failed' }));
        done();
      });
    });
  });

  describe('deleteSuccess$', () => {
    it('shows success toast', done => {
      actions$ = of(employeeActions.deleteSuccess({ id: 1 }));
      effects.deleteSuccess$.subscribe(() => {
        expect(mockToast.add).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'success', summary: 'Deleted' })
        );
        done();
      });
    });
  });

  describe('deleteFailure$', () => {
    it('shows error toast with message', done => {
      actions$ = of(employeeActions.deleteFailure({ error: 'Something went wrong' }));
      effects.deleteFailure$.subscribe(() => {
        expect(mockToast.add).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error', detail: 'Something went wrong' })
        );
        done();
      });
    });
  });
});
