# EMS Angular — Progress Log

## Stack
- Angular 21, standalone components, signals, `toSignal()`
- NgRx (store, effects, selectors, `createFeature`, `createActionGroup`)
- PrimeNG 21 with `@primeuix/themes` Aura theme
- Spring Boot backend at `http://localhost:8080/api`

---

## Phase 1 — Project Scaffold & Core Infrastructure

### What was built
| Layer | Files |
|---|---|
| Constants | `core/constants/api.constants.ts` — all API URLs including dynamic `(id)=>` helpers |
| Constants | `core/constants/app.constants.ts` — APP_ROUTES, STORAGE_KEYS, PAGINATION_DEFAULTS, ROLES |
| Models | `core/models/auth.model.ts`, `employee.model.ts`, `department.model.ts`, `status.model.ts` |
| Interceptors | `auth.interceptor.ts` — attaches Bearer token from NgRx store |
| Interceptors | `error.interceptor.ts` — 401→logout, 403/404/500→toast |
| Interceptors | `loading.interceptor.ts` — increments/decrements LoadingService counter |
| Services | `loading.service.ts` — signal-based `isLoading = computed(() => count > 0)` |
| Services | `auth-storage.service.ts` — read/write JWT + user from localStorage |
| App config | `app.config.ts` — wires HttpClient, interceptors, NgRx, PrimeNG, APP_INITIALIZER |
| Routing | `app.routes.ts` — lazy-loaded routes, `authGuard`, `adminGuard`, `ShellComponent` parent |

### Key decisions
- `authGuard` redirects to `/auth/login` when no token in store
- `adminGuard` redirects to `/employees` when role ≠ `ROLE_ADMIN`
- Session is restored on startup via `APP_INITIALIZER` reading localStorage before first render

---

## Phase 2 — Auth UI (Login & Register)

### What was built
| Component | File |
|---|---|
| Login page | `features/auth/login/` — reactive form, email + password, dispatches `authActions.login` |
| Register page | `features/auth/register/` — name, email, password, role dropdown, dispatches `authActions.register` |
| Shell layout | `shared/components/shell/` — top navbar, brand, employee/dept/status nav links, user avatar, logout |
| Auth NgRx | `store/auth/` — actions, reducer (`createFeature`), effects, selectors |

### Auth store shape
```
auth: { user, accessToken, refreshToken, loading, error }
```

### Auth effects
- `login$` / `register$` — POST to API, map to success/failure actions
- `onAuthSuccess$` — saves tokens + user to localStorage, shows welcome toast, navigates to `/employees`
- `logout$` — clears localStorage, navigates to `/auth/login`

### Fixes applied
- Removed `@ngx-translate` (i18n dropped in favour of plain English strings)
- `ButtonSeverity` is `'warn'` not `'warning'`
- Refresh token duplicate-key error: replaced derived `deleteByUser` in `RefreshTokenRepository` with `@Modifying @Query` direct JPQL DELETE

---

## Phase 3 — Lookup Store (Departments & Statuses)

### What was built
| File | Purpose |
|---|---|
| `core/services/lookup.service.ts` | GET `/departments` and `/statuses` |
| `store/lookup/lookup.actions.ts` | `load`, `loadDepartmentsSuccess`, `loadStatusesSuccess`, `loadFailure` |
| `store/lookup/lookup.reducer.ts` | `createFeature('lookup')` — stores `departments[]`, `statuses[]`, `loaded` flag |
| `store/lookup/lookup.effects.ts` | `forkJoin` both endpoints in one trip, dispatches two success actions |
| `store/lookup/lookup.selectors.ts` | `selectDepartments`, `selectStatuses`, `selectLoaded` |

### Key decision
`lookupActions.load()` is dispatched from `APP_INITIALIZER` (combined with `restoreSession`) so departments and statuses are fetched **once on app startup** and cached in the store. Employee form dropdowns read from the store — no extra HTTP calls.

---

## Phase 4 — Employee Store & List Page

### What was built
| File | Purpose |
|---|---|
| `core/services/employee.service.ts` | Full CRUD + file upload methods |
| `store/employee/employee.actions.ts` | `load`, `loadSuccess/Failure`, `delete`, `deleteSuccess/Failure`, `setParams` |
| `store/employee/employee.reducer.ts` | Stores `employees[]`, `totalElements`, `totalPages`, `loading`, `params` |
| `store/employee/employee.effects.ts` | Lazy search + delete with toast feedback |
| `store/employee/employee.selectors.ts` | All state slices exported |
| `features/employees/list/` | Full list page (see below) |

### Employee list features
- **PrimeNG `p-table`** — lazy mode, server-side pagination + sorting
- **Search** — keyword input (searches name/email), department dropdown, status dropdown
- **Filters clear** button resets all three and reloads
- **Avatar** — shows profile image or initials fallback
- **Status tag** — colour-coded by name (`active`→success, `probation`→warn, `terminated`→danger, `leave`→info)
- **Remote badge** — inline pill when `isRemote = true`
- **Actions** — View (all users), Edit + Delete (admin only via `isAdmin` signal)
- **Confirm dialog** before delete

---

## Pending Phases

| Phase | Description |
|---|---|
| 5 | Employee detail card page |
| 6 | Employee create/edit form (all PrimeNG controls, file upload) |
| 7 | Admin — Department CRUD page |
| 8 | Admin — Employment Status CRUD page |
