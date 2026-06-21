import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ApprovalDashboardComponent } from './approval-dashboard.component';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';

const mockEmployee: Partial<Employee> = {
  id: 2, firstName: 'Bob', lastName: 'Jones', workflowStatus: 'IN_APPROVAL',
};

const mockSvc = {
  getPendingApproval: jest.fn().mockReturnValue(of([mockEmployee])),
  approveEmployee:    jest.fn(),
};

describe('ApprovalDashboardComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockSvc.getPendingApproval.mockReturnValue(of([mockEmployee]));
    await TestBed.configureTestingModule({
      imports: [ApprovalDashboardComponent],
      providers: [
        provideRouter([]),
        MessageService,
        { provide: EmployeeService, useValue: mockSvc },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ApprovalDashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads pending approval queue on init', () => {
    const fixture = TestBed.createComponent(ApprovalDashboardComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.employees()).toEqual([mockEmployee]);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('loading is false after error', () => {
    mockSvc.getPendingApproval.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ApprovalDashboardComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('openDecision sets selected employee and decision', () => {
    const fixture = TestBed.createComponent(ApprovalDashboardComponent);
    const emp = mockEmployee as Employee;
    fixture.componentInstance.openDecision(emp, 'APPROVE');
    expect(fixture.componentInstance.selectedEmp).toBe(emp);
    expect(fixture.componentInstance.dialogDecision).toBe('APPROVE');
    expect(fixture.componentInstance.dialogVisible).toBe(true);
    expect(fixture.componentInstance.dialogNote).toBe('');
  });

  it('submitDecision does nothing when note is empty', () => {
    const fixture = TestBed.createComponent(ApprovalDashboardComponent);
    fixture.componentInstance.selectedEmp    = mockEmployee as Employee;
    fixture.componentInstance.dialogDecision = 'APPROVE';
    fixture.componentInstance.dialogNote     = '';
    fixture.componentInstance.submitDecision();
    expect(mockSvc.approveEmployee).not.toHaveBeenCalled();
  });

  it('submitDecision calls approveEmployee and reloads queue', () => {
    mockSvc.approveEmployee.mockReturnValue(of(null));
    const fixture = TestBed.createComponent(ApprovalDashboardComponent);
    fixture.componentInstance.selectedEmp    = mockEmployee as Employee;
    fixture.componentInstance.dialogDecision = 'REJECT';
    fixture.componentInstance.dialogNote     = 'Needs more info';
    fixture.componentInstance.submitDecision();
    expect(mockSvc.approveEmployee).toHaveBeenCalledWith(2, { decision: 'REJECT', note: 'Needs more info' });
    expect(fixture.componentInstance.dialogVisible).toBe(false);
    expect(mockSvc.getPendingApproval).toHaveBeenCalledTimes(1); // reload after decision
  });

  describe('getWorkflowSeverity', () => {
    let comp: ApprovalDashboardComponent;
    beforeEach(() => { comp = TestBed.createComponent(ApprovalDashboardComponent).componentInstance; });

    it('DRAFT → secondary',       () => expect(comp.getWorkflowSeverity('DRAFT')).toBe('secondary'));
    it('IN_REVIEW → info',        () => expect(comp.getWorkflowSeverity('IN_REVIEW')).toBe('info'));
    it('IN_APPROVAL → warn',      () => expect(comp.getWorkflowSeverity('IN_APPROVAL')).toBe('warn'));
    it('APPROVED → success',      () => expect(comp.getWorkflowSeverity('APPROVED')).toBe('success'));
    it('REJECTED → danger',       () => expect(comp.getWorkflowSeverity('REJECTED')).toBe('danger'));
  });

  describe('getWorkflowLabel', () => {
    let comp: ApprovalDashboardComponent;
    beforeEach(() => { comp = TestBed.createComponent(ApprovalDashboardComponent).componentInstance; });

    it('IN_APPROVAL → In Approval', () => expect(comp.getWorkflowLabel('IN_APPROVAL')).toBe('In Approval'));
    it('REJECTED → Rejected',       () => expect(comp.getWorkflowLabel('REJECTED')).toBe('Rejected'));
  });
});
