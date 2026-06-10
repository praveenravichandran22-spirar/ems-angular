import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { TableModule }  from 'primeng/table';
import { Button }       from 'primeng/button';
import { InputText }    from 'primeng/inputtext';
import { Select }       from 'primeng/select';
import { Tag }          from 'primeng/tag';
import { IconField }    from 'primeng/iconfield';
import { InputIcon }    from 'primeng/inputicon';
import { Dialog }       from 'primeng/dialog';
import { Password }     from 'primeng/password';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tooltip }       from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UserManagementService }                                          from '../../../core/services/user-management.service';
import { CreateUserRequest, UpdateUserRequest, UserRecord, UserSearchParams } from '../../../core/models/user-record.model';
import { PagedResponse }                            from '../../../core/models/employee.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, Button, InputText, Select, Tag, IconField, InputIcon,
    Dialog, Password, ConfirmDialog, Tooltip,
  ],
  templateUrl: './user-list.component.html',
  styleUrl:    './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly svc        = inject(UserManagementService);
  private readonly msgSvc     = inject(MessageService);
  private readonly confirmSvc = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$    = new Subject<string>();

  users         = signal<UserRecord[]>([]);
  totalElements = signal(0);
  loading       = signal(false);

  keyword    = '';
  roleFilter = '';

  params: UserSearchParams = { page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc' };

  // ── Create user dialog ──────────────────────────────────────────────────
  dialogVisible = signal(false);
  saving        = signal(false);

  form: CreateUserRequest = {
    firstName: '',
    lastName:  '',
    email:     '',
    password:  '',
    role:      'ROLE_REVIEWER',
  };

  // ── Edit user dialog ────────────────────────────────────────────────────
  editDialogVisible = signal(false);
  editSaving        = signal(false);
  editingUserId: number | null = null;

  editForm: UpdateUserRequest = {
    firstName: '',
    lastName:  '',
    role:      'ROLE_REVIEWER',
    password:  '',
  };

  // ── Dropdown options ────────────────────────────────────────────────────
  readonly roleOptions = [
    { label: 'All Roles',  value: '' },
    { label: 'Admin',      value: 'ROLE_ADMIN'    },
    { label: 'User',       value: 'ROLE_USER'     },
    { label: 'Reviewer',   value: 'ROLE_REVIEWER' },
    { label: 'Approver',   value: 'ROLE_APPROVER' },
  ];

  readonly createRoleOptions = [
    { label: 'Reviewer', value: 'ROLE_REVIEWER' },
    { label: 'Approver', value: 'ROLE_APPROVER' },
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

  openCreateDialog(): void {
    this.form = { firstName: '', lastName: '', email: '', password: '', role: 'ROLE_REVIEWER' };
    this.dialogVisible.set(true);
  }

  saveUser(): void {
    if (!this.form.firstName.trim() || !this.form.lastName.trim() ||
        !this.form.email.trim()     || !this.form.password.trim()) {
      return;
    }
    this.saving.set(true);
    this.svc.createUser(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.msgSvc.add({ severity: 'success', summary: 'User created', detail: `${this.form.firstName} ${this.form.lastName} added successfully`, life: 3000 });
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Failed to create user';
        this.msgSvc.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      },
    });
  }

  openEditDialog(user: UserRecord): void {
    this.editingUserId = user.id;
    this.editForm = {
      firstName: user.firstName,
      lastName:  user.lastName,
      role:      user.role as 'ROLE_REVIEWER' | 'ROLE_APPROVER',
      password:  '',
    };
    this.editDialogVisible.set(true);
  }

  saveEdit(): void {
    if (!this.editForm.firstName.trim() || !this.editForm.lastName.trim() || !this.editingUserId) return;
    this.editSaving.set(true);
    const payload: UpdateUserRequest = {
      firstName: this.editForm.firstName,
      lastName:  this.editForm.lastName,
      role:      this.editForm.role,
      ...(this.editForm.password?.trim() ? { password: this.editForm.password.trim() } : {}),
    };
    this.svc.updateUser(this.editingUserId, payload).subscribe({
      next: () => {
        this.editSaving.set(false);
        this.editDialogVisible.set(false);
        this.msgSvc.add({ severity: 'success', summary: 'Updated', detail: 'User updated successfully', life: 3000 });
        this.load();
      },
      error: err => {
        this.editSaving.set(false);
        this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'Failed to update user', life: 4000 });
      },
    });
  }

  deleteUser(user: UserRecord): void {
    this.confirmSvc.confirm({
      message:  `Delete ${user.firstName} ${user.lastName}? This cannot be undone.`,
      header:   'Confirm Delete',
      icon:     'pi pi-exclamation-triangle',
      accept:   () => {
        this.svc.deleteUser(user.id).subscribe({
          next: () => {
            this.msgSvc.add({ severity: 'success', summary: 'Deleted', detail: `${user.firstName} ${user.lastName} removed`, life: 3000 });
            this.load();
          },
          error: err => {
            this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'Failed to delete user', life: 4000 });
          },
        });
      },
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

  getRoleSeverity(role: string): 'danger' | 'warn' | 'info' | 'success' {
    switch (role) {
      case 'ROLE_ADMIN':    return 'danger';
      case 'ROLE_REVIEWER': return 'warn';
      case 'ROLE_APPROVER': return 'success';
      default:              return 'info';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':    return 'Admin';
      case 'ROLE_REVIEWER': return 'Reviewer';
      case 'ROLE_APPROVER': return 'Approver';
      default:              return 'User';
    }
  }
}
