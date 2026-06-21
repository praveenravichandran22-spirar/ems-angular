import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { authActions } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

const mockStore = {
  select: jest.fn((selector: unknown) => {
    if (selector === selectAuthLoading) return of(false);
    if (selector === selectAuthError)   return of(null);
    return of(null);
  }),
  dispatch: jest.fn(),
};

describe('LoginComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: Store, useValue: mockStore }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialise with an invalid form', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('isInvalid returns false when field is untouched', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.isInvalid('email')).toBe(false);
  });

  it('isInvalid returns true when field is touched and empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const ctrl = fixture.componentInstance.form.get('email');
    ctrl?.markAsTouched();
    expect(fixture.componentInstance.isInvalid('email')).toBe(true);
  });

  it('isInvalid returns true for invalid email format when touched', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const ctrl = fixture.componentInstance.form.get('email');
    ctrl?.setValue('not-an-email');
    ctrl?.markAsTouched();
    expect(fixture.componentInstance.isInvalid('email')).toBe(true);
  });

  it('isInvalid returns false when field has valid value', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const ctrl = fixture.componentInstance.form.get('email');
    ctrl?.setValue('admin@test.com');
    ctrl?.markAsTouched();
    expect(fixture.componentInstance.isInvalid('email')).toBe(false);
  });

  it('submit dispatches login action when form is valid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const comp = fixture.componentInstance;
    comp.form.setValue({ email: 'admin@test.com', password: 'secret' });
    comp.submit();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      authActions.login({ request: { email: 'admin@test.com', password: 'secret' } })
    );
  });

  it('submit marks all fields as touched when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const comp = fixture.componentInstance;
    comp.submit();
    const emailTouched = comp.form.get('email')?.touched;
    const passwordTouched = comp.form.get('password')?.touched;
    expect(emailTouched).toBe(true);
    expect(passwordTouched).toBe(true);
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });
});
