import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { TableModule } from 'primeng/table';
import { Button }      from 'primeng/button';
import { InputText }   from 'primeng/inputtext';
import { Select }      from 'primeng/select';
import { Tag }         from 'primeng/tag';
import { IconField }   from 'primeng/iconfield';
import { InputIcon }   from 'primeng/inputicon';

import { UserManagementService }         from '../../../core/services/user-management.service';
import { UserRecord, UserSearchParams }  from '../../../core/models/user-record.model';
import { PagedResponse }                 from '../../../core/models/employee.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, Button, InputText, Select, Tag, IconField, InputIcon],
  templateUrl: './user-list.component.html',
  styleUrl:    './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly svc        = inject(UserManagementService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$    = new Subject<string>();

  users         = signal<UserRecord[]>([]);
  totalElements = signal(0);
  loading       = signal(false);

  keyword    = '';
  roleFilter = '';

  params: UserSearchParams = { page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc' };

  readonly roleOptions = [
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'User',  value: 'ROLE_USER'  },
  ];

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
    const p: UserSearchParams = {
      ...this.params,
      keyword: this.keyword    || undefined,
      role:    this.roleFilter || undefined,
    };
    this.svc.search(p).subscribe({
      next: (res: PagedResponse<UserRecord>) => {
        this.users.set(res.content);
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

  onRoleChange(): void {
    this.params = { ...this.params, page: 0 };
    this.load();
  }

  onClear(): void {
    this.keyword    = '';
    this.roleFilter = '';
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

  getRoleSeverity(role: string): 'danger' | 'info' {
    return role === 'ROLE_ADMIN' ? 'danger' : 'info';
  }

  getRoleLabel(role: string): string {
    return role === 'ROLE_ADMIN' ? 'Admin' : 'User';
  }
}
