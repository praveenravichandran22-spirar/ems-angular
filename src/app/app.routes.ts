import { Routes } from '@angular/router';
import { ShellComponent } from './shared/components/shell/shell.component';
import { authGuard }      from './core/guards/auth.guard';
import { adminGuard }     from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'employees', pathMatch: 'full' },

  // ── Public — Auth pages (no shell) ───────────────────────────────────────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Protected — wrapped in Shell ─────────────────────────────────────────
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'employees',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/employees/list/employee-list.component').then(m => m.EmployeeListComponent),
          },
          {
            path: 'new',
            canActivate: [adminGuard],
            loadComponent: () =>
              import('./features/employees/form/employee-form.component').then(m => m.EmployeeFormComponent),
          },
          {
            path: ':id/edit',
            canActivate: [adminGuard],
            loadComponent: () =>
              import('./features/employees/form/employee-form.component').then(m => m.EmployeeFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/employees/detail/employee-detail.component').then(m => m.EmployeeDetailComponent),
          },
        ],
      },

      {
        path: 'students',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/students/list/student-list.component').then(m => m.StudentListComponent),
          },
          {
            path: 'new',
            canActivate: [adminGuard],
            loadComponent: () =>
              import('./features/students/form/student-form.component').then(m => m.StudentFormComponent),
          },
          {
            path: ':id/edit',
            canActivate: [adminGuard],
            loadComponent: () =>
              import('./features/students/form/student-form.component').then(m => m.StudentFormComponent),
          },
        ],
      },

      {
        path: 'sim',
        loadComponent: () =>
          import('./features/sim/sim-list.component').then(m => m.SimListComponent),
      },

      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/user-list.component').then(m => m.UserListComponent),
          },
          {
            path: 'departments',
            loadComponent: () =>
              import('./features/departments/department-list.component').then(m => m.DepartmentListComponent),
          },
          {
            path: 'statuses',
            loadComponent: () =>
              import('./features/statuses/status-list.component').then(m => m.StatusListComponent),
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: 'employees' },
];
