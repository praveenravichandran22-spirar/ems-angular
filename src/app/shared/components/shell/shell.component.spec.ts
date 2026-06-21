import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ShellComponent } from './shell.component';
import { LoadingService } from '../../../core/services/loading.service';
import { authActions } from '../../../store/auth/auth.actions';
import {
  selectIsAdmin,
  selectIsReviewer,
  selectIsApprover,
  selectFullName,
} from '../../../store/auth/auth.selectors';

const mockStore = {
  select: jest.fn((selector: unknown) => {
    if (selector === selectIsAdmin)    return of(false);
    if (selector === selectIsReviewer) return of(false);
    if (selector === selectIsApprover) return of(false);
    if (selector === selectFullName)   return of('John Doe');
    return of(null);
  }),
  dispatch: jest.fn(),
};

const mockLoading = { isLoading: jest.fn(() => false) };

describe('ShellComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        { provide: Store,          useValue: mockStore },
        { provide: LoadingService, useValue: mockLoading },
        MessageService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should select isAdmin from store', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance.isAdmin()).toBe(false);
  });

  it('should select isReviewer from store', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance.isReviewer()).toBe(false);
  });

  it('should select isApprover from store', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance.isApprover()).toBe(false);
  });

  it('should select fullName from store', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance.fullName()).toBe('John Doe');
  });

  it('logout dispatches logout action', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.componentInstance.logout();
    expect(mockStore.dispatch).toHaveBeenCalledWith(authActions.logout());
  });

  it('should reflect admin true when store returns true', async () => {
    mockStore.select.mockImplementation((selector: unknown) => {
      if (selector === selectIsAdmin)  return of(true);
      if (selector === selectFullName) return of('Admin User');
      return of(false);
    });
    TestBed.overrideProvider(Store, { useValue: mockStore });
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance.isAdmin()).toBe(true);
  });
});
