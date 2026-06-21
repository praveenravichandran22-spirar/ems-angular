import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';

import { EmployeeDetailComponent } from './employee-detail.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { selectIsAdmin } from '../../../store/auth/auth.selectors';
import { Employee } from '../../../core/models/employee.model';

const mockEmployee: Partial<Employee> = {
  id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com',
  gender: 'FEMALE', rating: 4, isRemote: false,
  workflowStatus: 'DRAFT', assignedReviewers: [], assignedApprovers: [],
  profileImageUrl: null,
};

const mockSvc = {
  getById:             jest.fn().mockReturnValue(of(mockEmployee)),
  getWorkflowHistory:  jest.fn().mockReturnValue(of([])),
  listReviewers:       jest.fn().mockReturnValue(of([])),
  listApprovers:       jest.fn().mockReturnValue(of([])),
  assignWorkflow:      jest.fn(),
  submitForReview:     jest.fn(),
  removeProfileImage:  jest.fn(),
  removeResume:        jest.fn(),
};

const mockStore = {
  select: jest.fn((selector: unknown) => {
    if (selector === selectIsAdmin) return of(false);
    return of(null);
  }),
  dispatch: jest.fn(),
};

const mockRoute = {
  snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } },
};

describe('EmployeeDetailComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockSvc.getById.mockReturnValue(of(mockEmployee));
    mockSvc.getWorkflowHistory.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [EmployeeDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: EmployeeService, useValue: mockSvc    },
        { provide: Store,           useValue: mockStore  },
        { provide: ActivatedRoute,  useValue: mockRoute  },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmployeeDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads employee on init', () => {
    const fixture = TestBed.createComponent(EmployeeDetailComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockSvc.getById).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.employee()).toEqual(mockEmployee);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('getInitials returns uppercase initials', () => {
    const fixture = TestBed.createComponent(EmployeeDetailComponent);
    expect(fixture.componentInstance.getInitials('john', 'doe')).toBe('JD');
  });

  it('formatGender formats underscored string correctly', () => {
    const fixture = TestBed.createComponent(EmployeeDetailComponent);
    expect(fixture.componentInstance.formatGender('PREFER_NOT_TO_SAY')).toBe('PREFER NOT TO SAY');
  });

  it('formatGender returns dash for null', () => {
    const fixture = TestBed.createComponent(EmployeeDetailComponent);
    expect(fixture.componentInstance.formatGender(null)).toBe('—');
  });

  describe('getWorkflowSeverity', () => {
    let comp: EmployeeDetailComponent;
    beforeEach(() => { comp = TestBed.createComponent(EmployeeDetailComponent).componentInstance; });

    it('DRAFT → secondary',       () => expect(comp.getWorkflowSeverity('DRAFT')).toBe('secondary'));
    it('IN_REVIEW → info',        () => expect(comp.getWorkflowSeverity('IN_REVIEW')).toBe('info'));
    it('IN_APPROVAL → warn',      () => expect(comp.getWorkflowSeverity('IN_APPROVAL')).toBe('warn'));
    it('APPROVED → success',      () => expect(comp.getWorkflowSeverity('APPROVED')).toBe('success'));
    it('REJECTED → danger',       () => expect(comp.getWorkflowSeverity('REJECTED')).toBe('danger'));
  });

  describe('getWorkflowLabel', () => {
    let comp: EmployeeDetailComponent;
    beforeEach(() => { comp = TestBed.createComponent(EmployeeDetailComponent).componentInstance; });

    it('DRAFT → Draft',                 () => expect(comp.getWorkflowLabel('DRAFT')).toBe('Draft'));
    it('IN_REVIEW → In Review',         () => expect(comp.getWorkflowLabel('IN_REVIEW')).toBe('In Review'));
    it('IN_APPROVAL → In Approval',     () => expect(comp.getWorkflowLabel('IN_APPROVAL')).toBe('In Approval'));
    it('APPROVED → Approved',           () => expect(comp.getWorkflowLabel('APPROVED')).toBe('Approved'));
    it('REJECTED → Rejected',           () => expect(comp.getWorkflowLabel('REJECTED')).toBe('Rejected'));
  });

  describe('getWorkflowIcon', () => {
    let comp: EmployeeDetailComponent;
    beforeEach(() => { comp = TestBed.createComponent(EmployeeDetailComponent).componentInstance; });

    it('DRAFT → pi-file-edit',      () => expect(comp.getWorkflowIcon('DRAFT')).toBe('pi-file-edit'));
    it('IN_REVIEW → pi-eye',        () => expect(comp.getWorkflowIcon('IN_REVIEW')).toBe('pi-eye'));
    it('APPROVED → pi-check-circle',() => expect(comp.getWorkflowIcon('APPROVED')).toBe('pi-check-circle'));
  });

  describe('getActionLabel', () => {
    let comp: EmployeeDetailComponent;
    beforeEach(() => { comp = TestBed.createComponent(EmployeeDetailComponent).componentInstance; });

    it('SUBMITTED → Submitted for Review', () => expect(comp.getActionLabel('SUBMITTED')).toBe('Submitted for Review'));
    it('REVIEW_APPROVED → Review Approved', () => expect(comp.getActionLabel('REVIEW_APPROVED')).toBe('Review Approved'));
    it('FINAL_REJECTED → Final Rejected',  () => expect(comp.getActionLabel('FINAL_REJECTED')).toBe('Final Rejected'));
    it('unknown type returns itself',       () => expect(comp.getActionLabel('UNKNOWN')).toBe('UNKNOWN'));
  });

  describe('getActionColor', () => {
    let comp: EmployeeDetailComponent;
    beforeEach(() => { comp = TestBed.createComponent(EmployeeDetailComponent).componentInstance; });

    it('APPROVED type returns green color',  () => expect(comp.getActionColor('FINAL_APPROVED')).toContain('green'));
    it('REJECTED type returns red color',    () => expect(comp.getActionColor('REVIEW_REJECTED')).toContain('red'));
    it('other type returns primary color',   () => expect(comp.getActionColor('SUBMITTED')).toContain('primary'));
  });

  describe('getStatusSeverity', () => {
    let comp: EmployeeDetailComponent;
    beforeEach(() => { comp = TestBed.createComponent(EmployeeDetailComponent).componentInstance; });

    it('undefined → secondary',  () => expect(comp.getStatusSeverity(undefined)).toBe('secondary'));
    it('Active → success',       () => expect(comp.getStatusSeverity('Active')).toBe('success'));
    it('Probation → warn',       () => expect(comp.getStatusSeverity('Probation')).toBe('warn'));
    it('Terminated → danger',    () => expect(comp.getStatusSeverity('Terminated')).toBe('danger'));
    it('On Leave → info',        () => expect(comp.getStatusSeverity('On Leave')).toBe('info'));
  });
});
