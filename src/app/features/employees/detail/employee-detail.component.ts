import { Component, OnInit, inject, signal } from '@angular/core';
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
import { FormsModule }     from '@angular/forms';

import { EmployeeService }  from '../../../core/services/employee.service';
import { Employee }         from '../../../core/models/employee.model';
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

  readonly isAdmin  = toSignal(this.store.select(selectIsAdmin), { initialValue: false });

  readonly employee = signal<Employee | null>(null);
  readonly loading  = signal(true);
  readonly error    = signal<string | null>(null);

  // read-only binding for p-rating
  ratingValue = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next: emp => {
        this.employee.set(emp);
        this.ratingValue = emp.rating ?? 0;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Employee not found.');
        this.loading.set(false);
      },
    });
  }

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

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;
    const left = 20;
    const col2 = 80;

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

    // ── Title ────────────────────────────────────────────────────────────
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

    // ── Name & status ────────────────────────────────────────────────────
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

    // ── Contact ──────────────────────────────────────────────────────────
    sectionHeader('Contact');
    line('Email',   emp.email);
    line('Phone',   emp.phone);
    line('Address', emp.address);

    // ── Personal ─────────────────────────────────────────────────────────
    sectionHeader('Personal Information');
    line('Gender',        this.formatGender(emp.gender));
    line('Date of Birth', emp.dateOfBirth
      ? new Date(emp.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : null);

    // ── Employment ───────────────────────────────────────────────────────
    sectionHeader('Employment');
    line('Department',   emp.department?.name);
    line('Joining Date', emp.joiningDate
      ? new Date(emp.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : null);
    line('Experience',   emp.experienceYears != null ? `${emp.experienceYears} years` : null);
    line('Remote',       emp.isRemote ? 'Yes' : 'No');
    if (this.isAdmin()) {
      line('Salary', emp.salary != null ? emp.salary.toLocaleString('en-US') : null);
      line('Rating', emp.rating != null ? `${emp.rating} / 5` : null);
    }

    // ── Bio ──────────────────────────────────────────────────────────────
    if (emp.bio) {
      sectionHeader('Bio');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(emp.bio, pageW - left * 2);
      doc.text(lines, left, y);
      y += lines.length * 6;
    }

    // ── Footer ───────────────────────────────────────────────────────────
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Employee Management System', pageW / 2, pageH - 10, { align: 'center' });

    doc.save(`${emp.firstName}_${emp.lastName}_profile.pdf`);
  }
}
