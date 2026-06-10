import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule }   from '@angular/common';
import { HttpClient }     from '@angular/common/http';
import { Store }          from '@ngrx/store';
import { toSignal }       from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import jsPDF from 'jspdf';

import { Button }          from 'primeng/button';
import { Avatar }          from 'primeng/avatar';
import { Tag }             from 'primeng/tag';
import { Divider }         from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmDialog }   from 'primeng/confirmdialog';
import { Tooltip }         from 'primeng/tooltip';
import { Rating }          from 'primeng/rating';
import { MultiSelect }     from 'primeng/multiselect';
import { FormsModule }     from '@angular/forms';

import { EmployeeService }  from '../../../core/services/employee.service';
import { Employee, WorkflowAction, WorkflowStatus, WorkflowUser } from '../../../core/models/employee.model';
import { resolveFileUrl }   from '../../../core/constants/api.constants';
import { selectIsAdmin }    from '../../../store/auth/auth.selectors';
import { employeeActions }  from '../../../store/employee/employee.actions';
import { APP_ROUTES }       from '../../../core/constants/app.constants';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    Button, Avatar, Tag, Divider, ProgressSpinner, ConfirmDialog, Tooltip, Rating,
    MultiSelect,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl:    './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly svc     = inject(EmployeeService);
  private readonly store   = inject(Store);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast   = inject(MessageService);
  private readonly http    = inject(HttpClient);

  readonly isAdmin = toSignal(this.store.select(selectIsAdmin), { initialValue: false });

  readonly employee = signal<Employee | null>(null);
  readonly loading  = signal(true);
  readonly error    = signal<string | null>(null);

  // ── Workflow state ──────────────────────────────────────────────────────
  readonly allReviewers      = signal<WorkflowUser[]>([]);
  readonly allApprovers      = signal<WorkflowUser[]>([]);
  readonly lastRejectionNote = signal<string | null>(null);
  readonly workflowHistory   = signal<WorkflowAction[]>([]);
  workflowSaving = false;
  submitting     = false;

  // plain arrays for p-multiselect two-way binding
  selectedReviewerIds: number[] = [];
  selectedApproverIds: number[] = [];

  // computed option lists with display label
  readonly reviewerOptions = computed(() =>
    this.allReviewers().map(u => ({ ...u, displayName: `${u.firstName} ${u.lastName}` }))
  );
  readonly approverOptions = computed(() =>
    this.allApprovers().map(u => ({ ...u, displayName: `${u.firstName} ${u.lastName}` }))
  );

  // read-only binding for p-rating
  ratingValue = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.svc.getById(id).subscribe({
      next: emp => {
        this.employee.set(emp);
        this.ratingValue = emp.rating ?? 0;
        this.selectedReviewerIds = emp.assignedReviewers?.map(r => r.id) ?? [];
        this.selectedApproverIds = emp.assignedApprovers?.map(r => r.id) ?? [];
        this.loading.set(false);

        // always load history for the timeline
        this.svc.getWorkflowHistory(emp.id).subscribe(history => {
          this.workflowHistory.set(history);
          if (emp.workflowStatus === 'REJECTED') {
            const last = history.find(a =>
              a.actionType === 'REVIEW_REJECTED' || a.actionType === 'FINAL_REJECTED'
            );
            this.lastRejectionNote.set(last?.note ?? null);
          }
        });
      },
      error: () => {
        this.error.set('Employee not found.');
        this.loading.set(false);
      },
    });

    // only admin can call these endpoints — non-admins would get 403
    if (this.isAdmin()) {
      this.svc.listReviewers().subscribe(r => this.allReviewers.set(r));
      this.svc.listApprovers().subscribe(a => this.allApprovers.set(a));
    }
  }

  // ── Workflow actions ────────────────────────────────────────────────────

  onWorkflowAssign(): void {
    const emp = this.employee();
    if (!emp) return;
    this.workflowSaving = true;
    this.svc.assignWorkflow(emp.id, {
      reviewerIds: this.selectedReviewerIds,
      approverIds: this.selectedApproverIds,
    }).subscribe({
      next: updated => {
        this.employee.set(updated);
        this.workflowSaving = false;
        this.toast.add({ severity: 'success', summary: 'Saved', detail: 'Workflow assignment updated', life: 2000 });
      },
      error: err => {
        this.workflowSaving = false;
        const msg = err?.error?.message ?? 'Failed to save assignment';
        this.toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      },
    });
  }

  submitForReview(): void {
    const emp = this.employee();
    if (!emp) return;
    this.submitting = true;
    this.svc.submitForReview(emp.id).subscribe({
      next: updated => {
        this.employee.set(updated);
        this.submitting = false;
        this.lastRejectionNote.set(null);
        this.toast.add({ severity: 'success', summary: 'Submitted', detail: 'Employee submitted for review', life: 3000 });
      },
      error: err => {
        this.submitting = false;
        const msg = err?.error?.message ?? 'Failed to submit';
        this.toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      },
    });
  }

  // ── Workflow display helpers ────────────────────────────────────────────

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
    switch (status) {
      case 'DRAFT':       return 'Draft';
      case 'IN_REVIEW':   return 'In Review';
      case 'IN_APPROVAL': return 'In Approval';
      case 'APPROVED':    return 'Approved';
      case 'REJECTED':    return 'Rejected';
    }
  }

  getWorkflowIcon(status: WorkflowStatus): string {
    switch (status) {
      case 'DRAFT':       return 'pi-file-edit';
      case 'IN_REVIEW':   return 'pi-eye';
      case 'IN_APPROVAL': return 'pi-clock';
      case 'APPROVED':    return 'pi-check-circle';
      case 'REJECTED':    return 'pi-times-circle';
    }
  }

  getActionLabel(type: string): string {
    const map: Record<string, string> = {
      SUBMITTED:       'Submitted for Review',
      REVIEW_APPROVED: 'Review Approved',
      REVIEW_REJECTED: 'Review Rejected',
      FINAL_APPROVED:  'Final Approved',
      FINAL_REJECTED:  'Final Rejected',
    };
    return map[type] ?? type;
  }

  getActionIcon(type: string): string {
    const map: Record<string, string> = {
      SUBMITTED:       'pi-send',
      REVIEW_APPROVED: 'pi-check',
      REVIEW_REJECTED: 'pi-times',
      FINAL_APPROVED:  'pi-check-circle',
      FINAL_REJECTED:  'pi-times-circle',
    };
    return map[type] ?? 'pi-circle';
  }

  getActionColor(type: string): string {
    if (type.includes('APPROVED')) return 'var(--p-green-500, #22c55e)';
    if (type.includes('REJECTED')) return 'var(--p-red-500, #ef4444)';
    return 'var(--p-primary-color)';
  }

  // ── Existing helpers ────────────────────────────────────────────────────

  edit(): void {
    const emp = this.employee();
    if (emp) this.router.navigate([APP_ROUTES.employees.edit(emp.id)]);
  }

  delete(): void {
    const emp = this.employee();
    if (!emp) return;
    this.confirm.confirm({
      message: `Delete ${emp.firstName} ${emp.lastName}? This cannot be undone.`,
      header:  'Confirm Delete',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => {
        this.store.dispatch(employeeActions.delete({ id: emp.id }));
        this.router.navigate([APP_ROUTES.employees.list]);
      },
    });
  }

  getStatusSeverity(name: string | undefined): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    if (!name) return 'secondary';
    const n = name.toLowerCase();
    if (n.includes('active'))                                return 'success';
    if (n.includes('probation'))                             return 'warn';
    if (n.includes('terminated') || n.includes('resigned')) return 'danger';
    if (n.includes('leave'))                                 return 'info';
    return 'secondary';
  }

  getInitials(first: string, last: string): string {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  resolveFileUrl = resolveFileUrl;

  formatGender(g: string | null): string {
    if (!g) return '—';
    return g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  downloadFile(relativeUrl: string | null | undefined, suggestedName: string): void {
    const url = this.resolveFileUrl(relativeUrl);
    if (!url) return;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = suggestedName;
        a.click();
        URL.revokeObjectURL(a.href);
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not download file.' }),
    });
  }

  exportToPdf(): void {
    const emp = this.employee();
    if (!emp) return;

    const generate = (imageDataUrl: string | null, imageFormat: string) => {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const left  = 20;
      const col2  = 80;
      const imgSize = 35;
      const imgX    = pageW - left - imgSize;
      let y = 20;

      const line = (label: string, value: string | null | undefined) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(label, left, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value ?? '—', col2, y);
        y += 7;
      };

      const sectionHeader = (title: string) => {
        y += 4;
        doc.setFillColor(240, 240, 240);
        doc.rect(left, y - 5, pageW - left * 2, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text(title, left + 2, y);
        doc.setTextColor(0, 0, 0);
        y += 8;
      };

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Employee Profile', pageW / 2, y, { align: 'center' });
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageW / 2, y, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      y += 10;

      doc.setDrawColor(200, 200, 200);
      doc.line(left, y, pageW - left, y);
      y += 8;

      if (imageDataUrl) {
        doc.addImage(imageDataUrl, imageFormat, imgX, 15, imgSize, imgSize);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`${emp.firstName} ${emp.lastName}`, left, y);
      y += 7;

      if (emp.department?.name) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(emp.department.name, left, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
      }
      if (emp.status?.name) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Status: ${emp.status.name}`, left, y);
        doc.setTextColor(0, 0, 0);
        y += 8;
      }

      if (imageDataUrl) y = Math.max(y, 55);

      sectionHeader('Contact');
      line('Email',   emp.email);
      line('Phone',   emp.phone);
      line('Address', emp.address);

      sectionHeader('Personal Information');
      line('Gender',        this.formatGender(emp.gender));
      line('Date of Birth', emp.dateOfBirth
        ? new Date(emp.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : null);

      sectionHeader('Employment');
      line('Department',   emp.department?.name);
      line('Country',      emp.country?.countryName);
      line('Joining Date', emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : null);
      line('Experience',   emp.experienceYears != null ? `${emp.experienceYears} years` : null);
      line('Remote',       emp.isRemote ? 'Yes' : 'No');
      if (this.isAdmin()) {
        line('Salary', emp.salary != null ? emp.salary.toLocaleString('en-US') : null);
        line('Rating', emp.rating != null ? `${emp.rating} / 5` : null);
      }

      if (emp.bio) {
        sectionHeader('Bio');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(emp.bio, pageW - left * 2);
        doc.text(lines, left, y);
        y += lines.length * 6;
      }

      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Employee Management System', pageW / 2, pageH - 10, { align: 'center' });

      doc.save(`${emp.firstName}_${emp.lastName}_profile.pdf`);
    };

    if (emp.profileImageUrl) {
      const url = this.resolveFileUrl(emp.profileImageUrl)!;
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: blob => {
          const format = blob.type.includes('png') ? 'PNG' : 'JPEG';
          const reader = new FileReader();
          reader.onloadend = () => generate(reader.result as string, format);
          reader.readAsDataURL(blob);
        },
        error: () => generate(null, 'JPEG'),
      });
    } else {
      generate(null, 'JPEG');
    }
  }
}
