import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';

import { employeeActions }                                                   from '../../../store/employee/employee.actions';
import { selectEmployees, selectLoading, selectParams, selectTotalElements } from '../../../store/employee/employee.selectors';
import { selectDepartments, selectStatuses, selectCountries }                                 from '../../../store/lookup/lookup.selectors';
import { selectIsAdmin, selectCurrentUserEmail }                              from '../../../store/auth/auth.selectors';
import { APP_ROUTES }                                                        from '../../../core/constants/app.constants';
import { resolveFileUrl }                                                    from '../../../core/constants/api.constants';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, FormsModule, RouterLink, TableModule, Button, InputText, Select, Tag, Avatar, ConfirmDialog, IconField, InputIcon, Tooltip],
  templateUrl: './employee-list.component.html',
  styleUrl:    './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private readonly store      = inject(Store);
  private readonly router     = inject(Router);
  private readonly confirm    = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchSubject = new Subject<string>();

  readonly employees   = toSignal(this.store.select(selectEmployees),     { initialValue: [] });
  readonly total       = toSignal(this.store.select(selectTotalElements),  { initialValue: 0 });
  readonly loading     = toSignal(this.store.select(selectLoading),        { initialValue: false });
  readonly params      = toSignal(this.store.select(selectParams),         { initialValue: { page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc' as const } });
  readonly departments = toSignal(this.store.select(selectDepartments),    { initialValue: [] });
  readonly statuses    = toSignal(this.store.select(selectStatuses),       { initialValue: [] });
  readonly countries   = toSignal(this.store.select(selectCountries),      { initialValue: [] });
  readonly isAdmin            = toSignal(this.store.select(selectIsAdmin),            { initialValue: false });
  readonly currentUserEmail   = toSignal(this.store.select(selectCurrentUserEmail),   { initialValue: null });

  keyword      = '';
  deptFilter:   number | null = null;
  statusFilter: number | null = null;
  countryFilter: number | null = null;

  revealedSalaries = new Set<number>();

  toggleSalary(id: number, event: Event): void {
    event.stopPropagation();
    this.revealedSalaries.has(id)
      ? this.revealedSalaries.delete(id)
      : this.revealedSalaries.add(id);
  }

  isSalaryRevealed(id: number): boolean {
    return this.revealedSalaries.has(id);
  }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.store.dispatch(employeeActions.setParams({ params: { page: 0 } }));
      this.loadEmployees();
    });
    this.loadEmployees();
  }

  onKeywordChange(value: string): void {
    this.keyword = value;
    this.searchSubject.next(value);
  }

  private buildParams() {
    const p = this.params();
    return {
      ...p,
      keyword:      this.keyword || undefined,
      departmentId: this.deptFilter ?? undefined,
      statusId:     this.statusFilter ?? undefined,
    };
  }

  loadEmployees(): void {
    this.store.dispatch(employeeActions.load({ params: this.buildParams() }));
  }

  onSearch(): void {
    this.store.dispatch(employeeActions.setParams({ params: { page: 0 } }));
    this.loadEmployees();
  }

  onClear(): void {
    this.keyword      = '';
    this.deptFilter   = null;
    this.statusFilter = null;
    this.countryFilter = null;
    this.searchSubject.next('');
    this.store.dispatch(employeeActions.setParams({ params: { page: 0 } }));
    this.loadEmployees();
  }

  onPage(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows);
    this.store.dispatch(employeeActions.load({ params: {
      ...this.buildParams(), page, size: event.rows,
    }}));
  }

  onSort(event: { field: string; order: number }): void {
    const sortDir = event.order === 1 ? 'asc' : 'desc';
    this.store.dispatch(employeeActions.load({ params: {
      ...this.buildParams(), sortBy: event.field, sortDir,
    }}));
  }

  viewEmployee(id: number): void {
    this.router.navigate([APP_ROUTES.employees.detail(id)]);
  }

  editEmployee(id: number): void {
    this.router.navigate([APP_ROUTES.employees.edit(id)]);
  }

  deleteEmployee(id: number, name: string): void {
    this.confirm.confirm({
      message: `Delete ${name}? This cannot be undone.`,
      header:  'Confirm Delete',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => this.store.dispatch(employeeActions.delete({ id })),
    });
  }

  getStatusSeverity(name: string | undefined): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    if (!name) return 'secondary';
    const n = name.toLowerCase();
    if (n.includes('active'))                                  return 'success';
    if (n.includes('probation'))                               return 'warn';
    if (n.includes('terminated') || n.includes('resigned'))    return 'danger';
    if (n.includes('leave'))                                   return 'info';
    return 'secondary';
  }

  getInitials(first: string, last: string): string {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  isAdminOwnRecord(empEmail: string): boolean {
    return this.isAdmin() && empEmail === this.currentUserEmail();
  }

  resolveFileUrl = resolveFileUrl;
}
