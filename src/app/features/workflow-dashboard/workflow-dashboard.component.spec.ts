import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { WorkflowDashboardComponent } from './workflow-dashboard.component';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';

const mockEmployee: Partial<Employee> = {
  id: 1, firstName: 'Alice', lastName: 'Smith', workflowStatus: 'IN_REVIEW',
};

function buildSvc() {
  return {
    getPendingReview:   jest.fn().mockReturnValue(of([mockEmployee])),
    getPendingApproval: jest.fn().mockReturnValue(of([mockEmployee])),
    reviewEmployee:     jest.fn(),
    approveEmployee:    jest.fn(),
  };
}

async function setup(mode: 'review' | 'approval', svc = buildSvc()) {
  await TestBed.configureTestingModule({
    imports: [WorkflowDashboardComponent],
    providers: [
      provideRouter([]),
      MessageService,
      { provide: EmployeeService, useValue: svc },
      { provide: ActivatedRoute, useValue: { snapshot: { data: { mode } } } },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(WorkflowDashboardComponent);
  return { fixture, comp: fixture.componentInstance, svc };
}

// ── Review mode ────────────────────────────────────────────────────────────────

describe('WorkflowDashboardComponent — review mode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create', async () => {
    const { comp } = await setup('review');
    expect(comp).toBeTruthy();
    expect(comp.mode).toBe('review');
  });

  it('has correct review labels', async () => {
    const { comp } = await setup('review');
    expect(comp.title).toBe('Review Queue');
    expect(comp.subtitle).toContain('review');
    expect(comp.emptyMsg).toContain('review');
    expect(comp.noteId).toBe('reviewNote');
    expect(comp.notePlaceholder).toContain('review');
  });

  it('loads review queue on init', async () => {
    const { comp, svc } = await setup('review');
    comp.ngOnInit();
    expect(svc.getPendingReview).toHaveBeenCalled();
    expect(comp.employees()).toEqual([mockEmployee]);
    expect(comp.loading()).toBe(false);
  });

  it('loading is false after error', async () => {
    const svc = buildSvc();
    svc.getPendingReview.mockReturnValue(throwError(() => new Error('fail')));
    const { comp } = await setup('review', svc);
    comp.ngOnInit();
    expect(comp.loading()).toBe(false);
  });

  it('openDecision sets state correctly', async () => {
    const { comp } = await setup('review');
    const emp = mockEmployee as Employee;
    comp.openDecision(emp, 'REJECT');
    expect(comp.selectedEmp).toBe(emp);
    expect(comp.dialogDecision).toBe('REJECT');
    expect(comp.dialogVisible).toBe(true);
    expect(comp.dialogNote).toBe('');
  });

  it('submitDecision does nothing when note is blank', async () => {
    const { comp, svc } = await setup('review');
    comp.selectedEmp    = mockEmployee as Employee;
    comp.dialogDecision = 'APPROVE';
    comp.dialogNote     = '   ';
    comp.submitDecision();
    expect(svc.reviewEmployee).not.toHaveBeenCalled();
  });

  it('submitDecision does nothing when no employee selected', async () => {
    const { comp, svc } = await setup('review');
    comp.selectedEmp = null;
    comp.dialogNote  = 'note';
    comp.submitDecision();
    expect(svc.reviewEmployee).not.toHaveBeenCalled();
  });

  it('submitDecision calls reviewEmployee and reloads queue', async () => {
    const { comp, svc } = await setup('review');
    svc.reviewEmployee.mockReturnValue(of(null));
    comp.selectedEmp    = mockEmployee as Employee;
    comp.dialogDecision = 'APPROVE';
    comp.dialogNote     = 'Looks good';
    comp.submitDecision();
    expect(svc.reviewEmployee).toHaveBeenCalledWith(1, { decision: 'APPROVE', note: 'Looks good' });
    expect(comp.dialogVisible).toBe(false);
    expect(comp.dialogSaving).toBe(false);
    expect(svc.getPendingReview).toHaveBeenCalledTimes(1);
  });

  it('submitDecision handles service error', async () => {
    const { comp, svc } = await setup('review');
    svc.reviewEmployee.mockReturnValue(throwError(() => ({ error: { message: 'server error' } })));
    comp.selectedEmp    = mockEmployee as Employee;
    comp.dialogDecision = 'REJECT';
    comp.dialogNote     = 'Bad record';
    comp.submitDecision();
    expect(comp.dialogSaving).toBe(false);
  });

  it('viewDetail navigates to employee detail route', async () => {
    const { comp } = await setup('review');
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    comp.viewDetail(42);
    expect(router.navigate).toHaveBeenCalled();
  });
});

// ── Approval mode ──────────────────────────────────────────────────────────────

describe('WorkflowDashboardComponent — approval mode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create', async () => {
    const { comp } = await setup('approval');
    expect(comp.mode).toBe('approval');
  });

  it('has correct approval labels', async () => {
    const { comp } = await setup('approval');
    expect(comp.title).toBe('Approval Queue');
    expect(comp.subtitle).toContain('approval');
    expect(comp.emptyMsg).toContain('approval');
    expect(comp.noteId).toBe('approvalNote');
    expect(comp.notePlaceholder).toContain('approval');
  });

  it('loads approval queue on init', async () => {
    const { comp, svc } = await setup('approval');
    comp.ngOnInit();
    expect(svc.getPendingApproval).toHaveBeenCalled();
    expect(comp.employees()).toEqual([mockEmployee]);
    expect(comp.loading()).toBe(false);
  });

  it('loading is false after error', async () => {
    const svc = buildSvc();
    svc.getPendingApproval.mockReturnValue(throwError(() => new Error('fail')));
    const { comp } = await setup('approval', svc);
    comp.ngOnInit();
    expect(comp.loading()).toBe(false);
  });

  it('submitDecision calls approveEmployee', async () => {
    const { comp, svc } = await setup('approval');
    svc.approveEmployee.mockReturnValue(of(null));
    comp.selectedEmp    = mockEmployee as Employee;
    comp.dialogDecision = 'REJECT';
    comp.dialogNote     = 'Needs more info';
    comp.submitDecision();
    expect(svc.approveEmployee).toHaveBeenCalledWith(1, { decision: 'REJECT', note: 'Needs more info' });
    expect(comp.dialogVisible).toBe(false);
  });

  it('submitDecision handles service error', async () => {
    const { comp, svc } = await setup('approval');
    svc.approveEmployee.mockReturnValue(throwError(() => new Error('fail')));
    comp.selectedEmp    = mockEmployee as Employee;
    comp.dialogDecision = 'APPROVE';
    comp.dialogNote     = 'ok';
    comp.submitDecision();
    expect(comp.dialogSaving).toBe(false);
  });
});

// ── Shared helpers ─────────────────────────────────────────────────────────────

describe('WorkflowDashboardComponent — shared helpers', () => {
  let comp: WorkflowDashboardComponent;

  beforeEach(async () => {
    jest.clearAllMocks();
    ({ comp } = await setup('review'));
  });

  describe('getWorkflowSeverity', () => {
    it('DRAFT → secondary',     () => expect(comp.getWorkflowSeverity('DRAFT')).toBe('secondary'));
    it('IN_REVIEW → info',      () => expect(comp.getWorkflowSeverity('IN_REVIEW')).toBe('info'));
    it('IN_APPROVAL → warn',    () => expect(comp.getWorkflowSeverity('IN_APPROVAL')).toBe('warn'));
    it('APPROVED → success',    () => expect(comp.getWorkflowSeverity('APPROVED')).toBe('success'));
    it('REJECTED → danger',     () => expect(comp.getWorkflowSeverity('REJECTED')).toBe('danger'));
  });

  describe('getWorkflowLabel', () => {
    it('DRAFT → Draft',             () => expect(comp.getWorkflowLabel('DRAFT')).toBe('Draft'));
    it('IN_REVIEW → In Review',     () => expect(comp.getWorkflowLabel('IN_REVIEW')).toBe('In Review'));
    it('IN_APPROVAL → In Approval', () => expect(comp.getWorkflowLabel('IN_APPROVAL')).toBe('In Approval'));
    it('APPROVED → Approved',       () => expect(comp.getWorkflowLabel('APPROVED')).toBe('Approved'));
    it('REJECTED → Rejected',       () => expect(comp.getWorkflowLabel('REJECTED')).toBe('Rejected'));
  });
});
