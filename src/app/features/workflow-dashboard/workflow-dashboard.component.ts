import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { TableModule }     from 'primeng/table';
import { Button }          from 'primeng/button';
import { Tag }             from 'primeng/tag';
import { Dialog }          from 'primeng/dialog';
import { Textarea }        from 'primeng/textarea';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MessageService }  from 'primeng/api';

import { EmployeeService }              from '../../core/services/employee.service';
import { Employee, WorkflowStatus }     from '../../core/models/employee.model';
import { WorkflowDecisionRequest }      from '../../core/models/workflow.model';
import { APP_ROUTES }                   from '../../core/constants/app.constants';

export type DashboardMode = 'review' | 'approval';

@Component({
  selector: 'app-workflow-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, Button, Tag, Dialog, Textarea, ProgressSpinner,
  ],
  templateUrl: './workflow-dashboard.component.html',
  styleUrl:    './workflow-dashboard.component.scss',
})
export class WorkflowDashboardComponent implements OnInit {
  private readonly svc    = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly toast  = inject(MessageService);

  readonly mode = this.route.snapshot.data['mode'] as DashboardMode;

  readonly employees = signal<Employee[]>([]);
  readonly loading   = signal(true);

  dialogVisible  = false;
  dialogDecision: 'APPROVE' | 'REJECT' = 'APPROVE';
  dialogNote     = '';
  dialogSaving   = false;
  selectedEmp: Employee | null = null;

  get title()           { return this.mode === 'review' ? 'Review Queue' : 'Approval Queue'; }
  get subtitle()        { return this.mode === 'review'
    ? 'Employee records assigned to you for review.'
    : 'Employee records assigned to you for final approval.'; }
  get emptyMsg()        { return this.mode === 'review'
    ? 'No records pending your review.'
    : 'No records pending your approval.'; }
  get noteId()          { return this.mode === 'review' ? 'reviewNote' : 'approvalNote'; }
  get notePlaceholder() { return this.mode === 'review'
    ? 'Enter your review note...'
    : 'Enter your approval note...'; }

  ngOnInit(): void { this.loadQueue(); }

  loadQueue(): void {
    this.loading.set(true);
    const obs = this.mode === 'review'
      ? this.svc.getPendingReview()
      : this.svc.getPendingApproval();
    obs.subscribe({
      next:  list => { this.employees.set(list); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  openDecision(emp: Employee, decision: 'APPROVE' | 'REJECT'): void {
    this.selectedEmp    = emp;
    this.dialogDecision = decision;
    this.dialogNote     = '';
    this.dialogVisible  = true;
  }

  submitDecision(): void {
    if (!this.selectedEmp || !this.dialogNote.trim()) return;
    this.dialogSaving = true;
    const req: WorkflowDecisionRequest = {
      decision: this.dialogDecision,
      note:     this.dialogNote.trim(),
    };
    const obs = this.mode === 'review'
      ? this.svc.reviewEmployee(this.selectedEmp.id, req)
      : this.svc.approveEmployee(this.selectedEmp.id, req);
    obs.subscribe({
      next: () => {
        this.dialogSaving  = false;
        this.dialogVisible = false;
        const label  = this.dialogDecision === 'APPROVE' ? 'approved' : 'rejected';
        const detail = this.mode === 'review'
          ? `Employee ${label} and moved to next stage.`
          : `Employee ${label}.`;
        this.toast.add({
          severity: this.dialogDecision === 'APPROVE' ? 'success' : 'warn',
          summary: 'Done', detail, life: 3000,
        });
        this.loadQueue();
      },
      error: err => {
        this.dialogSaving = false;
        this.toast.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.message ?? 'Action failed', life: 4000,
        });
      },
    });
  }

  viewDetail(id: number): void {
    this.router.navigate([APP_ROUTES.employees.detail(id)]);
  }

  getWorkflowSeverity(status: WorkflowStatus): 'secondary' | 'info' | 'warn' | 'success' | 'danger' {
    switch (status) {
      case 'DRAFT':       return 'secondary';
      case 'IN_REVIEW':   return 'info';
      case 'IN_APPROVAL': return 'warn';
      case 'APPROVED':    return 'success';
      case 'REJECTED':    return 'danger';
    }
  }

  getWorkflowLabel(status: WorkflowStatus): string {
    const map: Record<WorkflowStatus, string> = {
      DRAFT: 'Draft', IN_REVIEW: 'In Review', IN_APPROVAL: 'In Approval',
      APPROVED: 'Approved', REJECTED: 'Rejected',
    };
    return map[status];
  }
}
