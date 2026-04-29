import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { TableModule }   from 'primeng/table';
import { Button }        from 'primeng/button';
import { InputText }     from 'primeng/inputtext';
import { Select }        from 'primeng/select';
import { Tag }           from 'primeng/tag';
import { IconField }     from 'primeng/iconfield';
import { InputIcon }     from 'primeng/inputicon';
import { Tooltip }       from 'primeng/tooltip';

import { SimEmployeeService }          from '../../core/services/sim-employee.service';
import { SimEmployee, SimSearchParams } from '../../core/models/sim-employee.model';
import { PagedResponse }               from '../../core/models/employee.model';

@Component({
  selector: 'app-sim-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, Button, InputText, Select, Tag, IconField, InputIcon, Tooltip],
  templateUrl: './sim-list.component.html',
  styleUrl:    './sim-list.component.scss',
})
export class SimListComponent implements OnInit {
  private readonly svc        = inject(SimEmployeeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$    = new Subject<string>();

  employees      = signal<SimEmployee[]>([]);
  totalElements  = signal(0);
  loading        = signal(false);

  keyword      = '';
  deptFilter   = '';
  statusFilter = '';

  params: SimSearchParams = { page: 0, size: 25, sortBy: 'firstName', sortDir: 'asc' };

  readonly departmentOptions = [
    'Engineering','Human Resources','Finance','Marketing',
    'Sales','Operations','Legal','Design',
  ].map(d => ({ label: d, value: d }));

  readonly statusOptions = [
    'Active','Probation','On Leave','Inactive','Terminated',
  ].map(s => ({ label: s, value: s }));

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.params = { ...this.params, page: 0 };
      this.load();
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const p: SimSearchParams = {
      ...this.params,
      keyword:    this.keyword    || undefined,
      department: this.deptFilter || undefined,
      status:     this.statusFilter || undefined,
    };
    this.svc.search(p).subscribe({
      next: (res: PagedResponse<SimEmployee>) => {
        this.employees.set(res.content);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onKeywordChange(value: string): void {
    this.keyword = value;
    this.search$.next(value);
  }

  onFilterChange(): void {
    this.params = { ...this.params, page: 0 };
    this.load();
  }

  onClear(): void {
    this.keyword      = '';
    this.deptFilter   = '';
    this.statusFilter = '';
    this.search$.next('');
    this.params = { ...this.params, page: 0 };
    this.load();
  }

  onPage(event: { first: number; rows: number }): void {
    this.params = { ...this.params, page: Math.floor(event.first / event.rows), size: event.rows };
    this.load();
  }

  onSort(event: { field: string; order: number }): void {
    this.params = { ...this.params, sortBy: event.field, sortDir: event.order === 1 ? 'asc' : 'desc' };
    this.load();
  }

  getStatusSeverity(name: string | null): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    if (!name) return 'secondary';
    const n = name.toLowerCase();
    if (n.includes('active'))                                return 'success';
    if (n.includes('probation'))                             return 'warn';
    if (n.includes('terminated') || n.includes('resigned')) return 'danger';
    if (n.includes('leave'))                                 return 'info';
    return 'secondary';
  }
}
