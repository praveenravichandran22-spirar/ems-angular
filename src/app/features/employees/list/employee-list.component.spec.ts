import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';

import { EmployeeListComponent } from './employee-list.component';
import { employeeActions } from '../../../store/employee/employee.actions';
import {
  selectEmployees,
  selectLoading,
  selectParams,
  selectTotalElements,
} from '../../../store/employee/employee.selectors';
import {
  selectDepartments,
  selectStatuses,
  selectCountries,
} from '../../../store/lookup/lookup.selectors';
import {
  selectIsAdmin,
  selectIsReviewer,
  selectIsApprover,
  selectCurrentUserEmail,
} from '../../../store/auth/auth.selectors';

const mockStore = {
  select: jest.fn((selector: unknown) => {
    if (selector === selectEmployees)         return of([]);
    if (selector === selectLoading)           return of(false);
    if (selector === selectTotalElements)     return of(0);
    if (selector === selectParams)            return of({ page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc' });
    if (selector === selectDepartments)       return of([]);
    if (selector === selectStatuses)          return of([]);
    if (selector === selectCountries)         return of([]);
    if (selector === selectIsAdmin)           return of(false);
    if (selector === selectIsReviewer)        return of(false);
    if (selector === selectIsApprover)        return of(false);
    if (selector === selectCurrentUserEmail)  return of(null);
    return of(null);
  }),
  dispatch: jest.fn(),
};

describe('EmployeeListComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [
        provideRouter([]),
        { provide: Store, useValue: mockStore },
        ConfirmationService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('ngOnInit dispatches load action', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: employeeActions.load.type })
    );
  });

  it('showWorkflowColumn is false when not admin/reviewer/approver', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    expect(fixture.componentInstance.showWorkflowColumn()).toBe(false);
  });

  it('onKeywordChange sets keyword', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    fixture.componentInstance.onKeywordChange('bob');
    expect(fixture.componentInstance.keyword).toBe('bob');
  });

  it('onClear resets all filters', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    fixture.componentInstance.keyword      = 'x';
    fixture.componentInstance.deptFilter   = 1;
    fixture.componentInstance.statusFilter = 2;
    fixture.componentInstance.countryFilter = 3;
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance.keyword).toBe('');
    expect(fixture.componentInstance.deptFilter).toBeNull();
    expect(fixture.componentInstance.statusFilter).toBeNull();
    expect(fixture.componentInstance.countryFilter).toBeNull();
  });

  it('onPage dispatches load with correct page', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    mockStore.dispatch.mockClear();
    fixture.componentInstance.onPage({ first: 20, rows: 10 });
    const call = mockStore.dispatch.mock.calls[0][0];
    expect(call.params.page).toBe(2);
    expect(call.params.size).toBe(10);
  });

  it('onSort sets sortDir asc when order=1', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    mockStore.dispatch.mockClear();
    fixture.componentInstance.onSort({ field: 'email', order: 1 });
    const call = mockStore.dispatch.mock.calls[0][0];
    expect(call.params.sortDir).toBe('asc');
  });

  it('onSort sets sortDir desc when order=-1', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    mockStore.dispatch.mockClear();
    fixture.componentInstance.onSort({ field: 'email', order: -1 });
    const call = mockStore.dispatch.mock.calls[0][0];
    expect(call.params.sortDir).toBe('desc');
  });

  it('getInitials returns uppercase initials', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    expect(fixture.componentInstance.getInitials('john', 'doe')).toBe('JD');
  });

  it('isAdminOwnRecord returns false when not admin', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    expect(fixture.componentInstance.isAdminOwnRecord('user@test.com')).toBe(false);
  });

  it('toggleSalary reveals then hides salary', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    const comp = fixture.componentInstance;
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    comp.toggleSalary(1, event);
    expect(comp.isSalaryRevealed(1)).toBe(true);
    comp.toggleSalary(1, event);
    expect(comp.isSalaryRevealed(1)).toBe(false);
  });

  describe('getStatusSeverity', () => {
    let comp: EmployeeListComponent;
    beforeEach(() => {
      comp = TestBed.createComponent(EmployeeListComponent).componentInstance;
    });

    it('returns secondary for undefined', () => expect(comp.getStatusSeverity(undefined)).toBe('secondary'));
    it('returns success for Active',     () => expect(comp.getStatusSeverity('Active')).toBe('success'));
    it('returns warn for Probation',     () => expect(comp.getStatusSeverity('Probation')).toBe('warn'));
    it('returns danger for Terminated',  () => expect(comp.getStatusSeverity('Terminated')).toBe('danger'));
    it('returns danger for Resigned',    () => expect(comp.getStatusSeverity('Resigned')).toBe('danger'));
    it('returns info for On Leave',      () => expect(comp.getStatusSeverity('On Leave')).toBe('info'));
  });

  describe('getWorkflowSeverity', () => {
    let comp: EmployeeListComponent;
    beforeEach(() => {
      comp = TestBed.createComponent(EmployeeListComponent).componentInstance;
    });

    it('returns secondary for DRAFT',       () => expect(comp.getWorkflowSeverity('DRAFT')).toBe('secondary'));
    it('returns info for IN_REVIEW',        () => expect(comp.getWorkflowSeverity('IN_REVIEW')).toBe('info'));
    it('returns warn for IN_APPROVAL',      () => expect(comp.getWorkflowSeverity('IN_APPROVAL')).toBe('warn'));
    it('returns success for APPROVED',      () => expect(comp.getWorkflowSeverity('APPROVED')).toBe('success'));
    it('returns danger for REJECTED',       () => expect(comp.getWorkflowSeverity('REJECTED')).toBe('danger'));
  });

  describe('getWorkflowLabel', () => {
    let comp: EmployeeListComponent;
    beforeEach(() => {
      comp = TestBed.createComponent(EmployeeListComponent).componentInstance;
    });

    it('labels DRAFT as Draft',               () => expect(comp.getWorkflowLabel('DRAFT')).toBe('Draft'));
    it('labels IN_REVIEW as In Review',       () => expect(comp.getWorkflowLabel('IN_REVIEW')).toBe('In Review'));
    it('labels IN_APPROVAL as In Approval',   () => expect(comp.getWorkflowLabel('IN_APPROVAL')).toBe('In Approval'));
    it('labels APPROVED as Approved',         () => expect(comp.getWorkflowLabel('APPROVED')).toBe('Approved'));
    it('labels REJECTED as Rejected',         () => expect(comp.getWorkflowLabel('REJECTED')).toBe('Rejected'));
  });
});
