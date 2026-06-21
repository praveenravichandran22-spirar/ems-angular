import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
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

const validForm = {
  firstName: 'John',
  lastName:  'Doe',
  email:     'john@test.com',
  password:  'secret1',
  role:      'ROLE_USER',
};

describe('RegisterComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: Store, useValue: mockStore }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialise with an invalid form', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('should default role to ROLE_USER', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance.form.get('role')?.value).toBe('ROLE_USER');
  });

  it('roleOptions contains Admin and Regular User', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const labels = fixture.componentInstance.roleOptions.map(o => o.label);
    expect(labels).toContain('Admin');
    expect(labels).toContain('Regular User');
  });

  it('isInvalid returns false when field is untouched', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance.isInvalid('email')).toBe(false);
  });

  it('isInvalid returns true when required field is touched and empty', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const ctrl = fixture.componentInstance.form.get('firstName');
    ctrl?.markAsTouched();
    expect(fixture.componentInstance.isInvalid('firstName')).toBe(true);
  });

  it('isInvalid returns true for invalid email format when touched', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const ctrl = fixture.componentInstance.form.get('email');
    ctrl?.setValue('bad-email');
    ctrl?.markAsTouched();
    expect(fixture.componentInstance.isInvalid('email')).toBe(true);
  });

  it('isInvalid returns true when password is too short', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const ctrl = fixture.componentInstance.form.get('password');
    ctrl?.setValue('abc');
    ctrl?.markAsTouched();
    expect(fixture.componentInstance.isInvalid('password')).toBe(true);
  });

  it('isInvalid returns false when field has valid value', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const ctrl = fixture.componentInstance.form.get('email');
    ctrl?.setValue('valid@test.com');
    ctrl?.markAsTouched();
    expect(fixture.componentInstance.isInvalid('email')).toBe(false);
  });

  it('submit dispatches register action when form is valid', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.componentInstance.form.setValue(validForm);
    fixture.componentInstance.submit();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      authActions.register({ request: validForm as any })
    );
  });

  it('submit marks all fields touched when form is invalid', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.componentInstance.submit();
    const fields = ['firstName', 'lastName', 'email', 'password', 'role'];
    fields.forEach(f => {
      expect(fixture.componentInstance.form.get(f)?.touched).toBe(true);
    });
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });
});
