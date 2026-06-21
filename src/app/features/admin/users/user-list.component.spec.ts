import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UserListComponent } from './user-list.component';
import { UserManagementService } from '../../../core/services/user-management.service';
import { UserRecord } from '../../../core/models/user-record.model';

const mockUser: UserRecord = {
  id: 1, firstName: 'Alice', lastName: 'Smith',
  email: 'alice@test.com', role: 'ROLE_REVIEWER', enabled: true,
};

const mockPage = {
  content: [mockUser], totalElements: 1, totalPages: 1, page: 0, size: 10, last: true,
};

const mockSvc = {
  search:     jest.fn().mockReturnValue(of(mockPage)),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

describe('UserListComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockSvc.search.mockReturnValue(of(mockPage));
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: UserManagementService, useValue: mockSvc },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads users on init', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.users()).toEqual([mockUser]);
    expect(fixture.componentInstance.totalElements()).toBe(1);
  });

  it('loading is false after successful load', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.load();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('loading is false after error', () => {
    mockSvc.search.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.load();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('roleOptions has 5 entries (all + 4 roles)', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    expect(fixture.componentInstance.roleOptions).toHaveLength(5);
  });

  it('createRoleOptions has 2 entries (Reviewer and Approver)', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    expect(fixture.componentInstance.createRoleOptions).toHaveLength(2);
  });

  it('onKeywordChange sets keyword', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.onKeywordChange('bob');
    expect(fixture.componentInstance.keyword).toBe('bob');
  });

  it('onRoleChange resets page to 0 and reloads', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.params.page = 5;
    mockSvc.search.mockClear();
    fixture.componentInstance.onRoleChange();
    expect(fixture.componentInstance.params.page).toBe(0);
    expect(mockSvc.search).toHaveBeenCalled();
  });

  it('onClear resets keyword and roleFilter', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.keyword    = 'x';
    fixture.componentInstance.roleFilter = 'ROLE_ADMIN';
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance.keyword).toBe('');
    expect(fixture.componentInstance.roleFilter).toBe('');
  });

  it('onPage updates page and size', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.onPage({ first: 20, rows: 10 });
    expect(fixture.componentInstance.params.page).toBe(2);
    expect(fixture.componentInstance.params.size).toBe(10);
  });

  it('onSort updates sortBy and sortDir', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.onSort({ field: 'email', order: -1 });
    expect(fixture.componentInstance.params.sortBy).toBe('email');
    expect(fixture.componentInstance.params.sortDir).toBe('desc');
  });

  it('openCreateDialog resets form and shows dialog', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.form.firstName = 'Old';
    fixture.componentInstance.openCreateDialog();
    expect(fixture.componentInstance.form.firstName).toBe('');
    expect(fixture.componentInstance.dialogVisible()).toBe(true);
  });

  it('saveUser does nothing when required fields are empty', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.form = { firstName: '', lastName: '', email: '', password: '', role: 'ROLE_REVIEWER' };
    fixture.componentInstance.saveUser();
    expect(mockSvc.createUser).not.toHaveBeenCalled();
  });

  it('saveUser calls createUser when form is complete', () => {
    mockSvc.createUser.mockReturnValue(of({}));
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.form = {
      firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com',
      password: 'pass123', role: 'ROLE_REVIEWER',
    };
    fixture.componentInstance.saveUser();
    expect(mockSvc.createUser).toHaveBeenCalled();
  });

  it('saveEdit does nothing when firstName is empty', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.editingUserId = 1;
    fixture.componentInstance.editForm = { firstName: '', lastName: 'Smith', role: 'ROLE_REVIEWER', password: '' };
    fixture.componentInstance.saveEdit();
    expect(mockSvc.updateUser).not.toHaveBeenCalled();
  });

  it('openEditDialog sets editing user id and shows dialog', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.componentInstance.openEditDialog(mockUser);
    expect(fixture.componentInstance.editingUserId).toBe(1);
    expect(fixture.componentInstance.editForm.firstName).toBe('Alice');
    expect(fixture.componentInstance.editDialogVisible()).toBe(true);
  });

  describe('getRoleSeverity', () => {
    let comp: UserListComponent;
    beforeEach(() => { comp = TestBed.createComponent(UserListComponent).componentInstance; });

    it('ROLE_ADMIN → danger',     () => expect(comp.getRoleSeverity('ROLE_ADMIN')).toBe('danger'));
    it('ROLE_REVIEWER → warn',    () => expect(comp.getRoleSeverity('ROLE_REVIEWER')).toBe('warn'));
    it('ROLE_APPROVER → success', () => expect(comp.getRoleSeverity('ROLE_APPROVER')).toBe('success'));
    it('ROLE_USER → info',        () => expect(comp.getRoleSeverity('ROLE_USER')).toBe('info'));
  });

  describe('getRoleLabel', () => {
    let comp: UserListComponent;
    beforeEach(() => { comp = TestBed.createComponent(UserListComponent).componentInstance; });

    it('ROLE_ADMIN → Admin',       () => expect(comp.getRoleLabel('ROLE_ADMIN')).toBe('Admin'));
    it('ROLE_REVIEWER → Reviewer', () => expect(comp.getRoleLabel('ROLE_REVIEWER')).toBe('Reviewer'));
    it('ROLE_APPROVER → Approver', () => expect(comp.getRoleLabel('ROLE_APPROVER')).toBe('Approver'));
    it('ROLE_USER → User',         () => expect(comp.getRoleLabel('ROLE_USER')).toBe('User'));
  });
});
