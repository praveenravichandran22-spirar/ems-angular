import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { StudentEffects } from './student.effects';
import { studentActions } from './student.actions';
import { StudentService } from '../../core/services/student.service';
import { Student } from '../../core/models/student.model';
import { PagedResponse } from '../../core/models/employee.model';

const mockStudent = { id: 1, firstName: 'Alice' } as Student;
const mockPage: PagedResponse<Student> = { content: [mockStudent], totalElements: 1, totalPages: 1, page: 0, size: 10, last: true };
const baseParams = { page: 0, size: 10, sortBy: 'firstName' as const, sortDir: 'asc' as const };

describe('StudentEffects', () => {
  let actions$: Observable<Action>;
  let effects: StudentEffects;
  let mockSvc: { search: jest.Mock; delete: jest.Mock };
  let mockToast: { add: jest.Mock };

  beforeEach(() => {
    mockSvc   = { search: jest.fn(), delete: jest.fn() };
    mockToast = { add: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        StudentEffects,
        provideMockActions(() => actions$),
        { provide: StudentService, useValue: mockSvc },
        { provide: MessageService, useValue: mockToast },
      ],
    });
    effects = TestBed.inject(StudentEffects);
  });

  describe('load$', () => {
    it('dispatches loadSuccess on success', done => {
      mockSvc.search.mockReturnValue(of(mockPage));
      actions$ = of(studentActions.load({ params: baseParams }));
      effects.load$.subscribe(action => {
        expect(action).toEqual(studentActions.loadSuccess({ data: mockPage }));
        done();
      });
    });

    it('dispatches loadFailure on error', done => {
      mockSvc.search.mockReturnValue(throwError(() => ({ message: 'Failed' })));
      actions$ = of(studentActions.load({ params: baseParams }));
      effects.load$.subscribe(action => {
        expect(action).toEqual(studentActions.loadFailure({ error: 'Failed' }));
        done();
      });
    });

    it('uses default message when error has no message', done => {
      mockSvc.search.mockReturnValue(throwError(() => ({})));
      actions$ = of(studentActions.load({ params: baseParams }));
      effects.load$.subscribe(action => {
        expect(action).toEqual(studentActions.loadFailure({ error: 'Failed to load students' }));
        done();
      });
    });
  });

  describe('delete$', () => {
    it('dispatches deleteSuccess on success', done => {
      mockSvc.delete.mockReturnValue(of(undefined));
      actions$ = of(studentActions.delete({ id: 1 }));
      effects.delete$.subscribe(action => {
        expect(action).toEqual(studentActions.deleteSuccess({ id: 1 }));
        done();
      });
    });

    it('dispatches deleteFailure on error', done => {
      mockSvc.delete.mockReturnValue(throwError(() => ({ message: 'Delete failed' })));
      actions$ = of(studentActions.delete({ id: 1 }));
      effects.delete$.subscribe(action => {
        expect(action).toEqual(studentActions.deleteFailure({ error: 'Delete failed' }));
        done();
      });
    });

    it('uses default message when delete error has no message', done => {
      mockSvc.delete.mockReturnValue(throwError(() => ({})));
      actions$ = of(studentActions.delete({ id: 1 }));
      effects.delete$.subscribe(action => {
        expect(action).toEqual(studentActions.deleteFailure({ error: 'Delete failed' }));
        done();
      });
    });
  });

  describe('deleteSuccess$', () => {
    it('shows success toast', done => {
      actions$ = of(studentActions.deleteSuccess({ id: 1 }));
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
      actions$ = of(studentActions.deleteFailure({ error: 'Error message' }));
      effects.deleteFailure$.subscribe(() => {
        expect(mockToast.add).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error', detail: 'Error message' })
        );
        done();
      });
    });
  });
});
