import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';

import { StudentListComponent } from './student-list.component';
import { studentActions } from '../../../store/student/student.actions';
import {
  selectStudents,
  selectLoading,
  selectParams,
  selectTotalElements,
} from '../../../store/student/student.selectors';
import { selectIsAdmin } from '../../../store/auth/auth.selectors';

const mockStore = {
  select: jest.fn((selector: unknown) => {
    if (selector === selectStudents)      return of([]);
    if (selector === selectLoading)       return of(false);
    if (selector === selectTotalElements) return of(0);
    if (selector === selectParams)        return of({ page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc' });
    if (selector === selectIsAdmin)       return of(false);
    return of(null);
  }),
  dispatch: jest.fn(),
};

describe('StudentListComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideRouter([]),
        { provide: Store, useValue: mockStore },
        ConfirmationService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('ngOnInit dispatches load action', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: studentActions.load.type })
    );
  });

  it('yearOptions has 5 entries (all + 4 years)', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    expect(fixture.componentInstance.yearOptions).toHaveLength(5);
  });

  it('genderOptions has 4 entries', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    expect(fixture.componentInstance.genderOptions).toHaveLength(4);
  });

  it('onKeywordChange sets keyword', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.componentInstance.onKeywordChange('alice');
    expect(fixture.componentInstance.keyword).toBe('alice');
  });

  it('onClear resets all filters', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.componentInstance.keyword      = 'x';
    fixture.componentInstance.courseFilter = 'CS';
    fixture.componentInstance.yearFilter   = 2;
    fixture.componentInstance.genderFilter = 'MALE';
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance.keyword).toBe('');
    expect(fixture.componentInstance.courseFilter).toBe('');
    expect(fixture.componentInstance.yearFilter).toBeNull();
    expect(fixture.componentInstance.genderFilter).toBeNull();
  });

  it('onPage dispatches load with correct page and size', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    mockStore.dispatch.mockClear();
    fixture.componentInstance.onPage({ first: 20, rows: 10 });
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: studentActions.load.type })
    );
  });

  it('onSort dispatches load with asc direction when order=1', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    mockStore.dispatch.mockClear();
    fixture.componentInstance.onSort({ field: 'lastName', order: 1 });
    const call = mockStore.dispatch.mock.calls[0][0];
    expect(call.params.sortDir).toBe('asc');
    expect(call.params.sortBy).toBe('lastName');
  });

  it('onSort dispatches load with desc direction when order=-1', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    mockStore.dispatch.mockClear();
    fixture.componentInstance.onSort({ field: 'email', order: -1 });
    const call = mockStore.dispatch.mock.calls[0][0];
    expect(call.params.sortDir).toBe('desc');
  });

  it('getInitials returns uppercase initials', () => {
    const fixture = TestBed.createComponent(StudentListComponent);
    expect(fixture.componentInstance.getInitials('alice', 'smith')).toBe('AS');
  });

  describe('getGpaColor', () => {
    let comp: StudentListComponent;
    beforeEach(() => {
      comp = TestBed.createComponent(StudentListComponent).componentInstance;
    });

    it('returns secondary for null', () => expect(comp.getGpaColor(null)).toBe('secondary'));
    it('returns success for gpa >= 3.5', () => expect(comp.getGpaColor(3.5)).toBe('success'));
    it('returns warn for gpa between 2.5 and 3.5', () => expect(comp.getGpaColor(3.0)).toBe('warn'));
    it('returns danger for gpa < 2.5', () => expect(comp.getGpaColor(2.0)).toBe('danger'));
  });
});
