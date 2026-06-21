import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ReviewDashboardComponent } from './review-dashboard.component';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';

const mockEmployee: Partial<Employee> = {
  id: 1, firstName: 'Alice', lastName: 'Smith', workflowStatus: 'IN_REVIEW',
};

const mockSvc = {
  getPendingReview:  jest.fn().mockReturnValue(of([mockEmployee])),
  reviewEmployee:    jest.fn(),
};

describe('ReviewDashboardComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockSvc.getPendingReview.mockReturnValue(of([mockEmployee]));
    await TestBed.configureTestingModule({
      imports: [ReviewDashboardComponent],
      providers: [
        provideRouter([]),
        MessageService,
        { provide: EmployeeService, useValue: mockSvc },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReviewDashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads pending review queue on init', () => {
    const fixture = TestBed.createComponent(ReviewDashboardComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.employees()).toEqual([mockEmployee]);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('loading is false after error', () => {
    mockSvc.getPendingReview.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ReviewDashboardComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('openDecision sets selected employee and decision', () => {
    const fixture = TestBed.createComponent(ReviewDashboardComponent);
    const emp = mockEmployee as Employee;
    fixture.componentInstance.openDecision(emp, 'REJECT');
    expect(fixture.componentInstance.selectedEmp).toBe(emp);
    expect(fixture.componentInstance.dialogDecision).toBe('REJECT');
    expect(fixture.componentInstance.dialogVisible).toBe(true);
    expect(fixture.componentInstance.dialogNote).toBe('');
  });

  it('submitDecision does nothing when note is empty', () => {
    const fixture = TestBed.createComponent(ReviewDashboardComponent);
    fixture.componentInstance.selectedEmp    = mockEmployee as Employee;
    fixture.componentInstance.dialogDecision = 'APPROVE';
    fixture.componentInstance.dialogNote     = '';
    fixture.componentInstance.submitDecision();
    expect(mockSvc.reviewEmployee).not.toHaveBeenCalled();
  });

  it('submitDecision calls reviewEmployee and reloads queue', () => {
    mockSvc.reviewEmployee.mockReturnValue(of(null));
    const fixture = TestBed.createComponent(ReviewDashboardComponent);
    fixture.componentInstance.selectedEmp    = mockEmployee as Employee;
    fixture.componentInstance.dialogDecision = 'APPROVE';
    fixture.componentInstance.dialogNote     = 'Looks good';
    fixture.componentInstance.submitDecision();
    expect(mockSvc.reviewEmployee).toHaveBeenCalledWith(1, { decision: 'APPROVE', note: 'Looks good' });
    expect(fixture.componentInstance.dialogVisible).toBe(false);
    expect(mockSvc.getPendingReview).toHaveBeenCalledTimes(1); // reload after decision
  });

  describe('getWorkflowSeverity', () => {
    let comp: ReviewDashboardComponent;
    beforeEach(() => { comp = TestBed.createComponent(ReviewDashboardComponent).componentInstance; });

    it('DRAFT → secondary',     () => expect(comp.getWorkflowSeverity('DRAFT')).toBe('secondary'));
    it('IN_REVIEW → info',      () => expect(comp.getWorkflowSeverity('IN_REVIEW')).toBe('info'));
    it('IN_APPROVAL → warn',    () => expect(comp.getWorkflowSeverity('IN_APPROVAL')).toBe('warn'));
    it('APPROVED → success',    () => expect(comp.getWorkflowSeverity('APPROVED')).toBe('success'));
    it('REJECTED → danger',     () => expect(comp.getWorkflowSeverity('REJECTED')).toBe('danger'));
  });

  describe('getWorkflowLabel', () => {
    let comp: ReviewDashboardComponent;
    beforeEach(() => { comp = TestBed.createComponent(ReviewDashboardComponent).componentInstance; });

    it('IN_REVIEW → In Review',     () => expect(comp.getWorkflowLabel('IN_REVIEW')).toBe('In Review'));
    it('APPROVED → Approved',       () => expect(comp.getWorkflowLabel('APPROVED')).toBe('Approved'));
  });
});
