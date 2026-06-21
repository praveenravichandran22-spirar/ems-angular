import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';

import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeService } from '../../../core/services/employee.service';
import {
  selectDepartments,
  selectStatuses,
  selectCountries,
} from '../../../store/lookup/lookup.selectors';

const mockSvc = {
  getById:            jest.fn(),
  create:             jest.fn(),
  update:             jest.fn(),
  uploadProfileImage: jest.fn(),
  uploadResume:       jest.fn(),
  removeProfileImage: jest.fn(),
  removeResume:       jest.fn(),
};

const mockStore = {
  select: jest.fn((selector: unknown) => {
    if (selector === selectDepartments) return of([]);
    if (selector === selectStatuses)    return of([]);
    if (selector === selectCountries)   return of([]);
    return of(null);
  }),
  dispatch: jest.fn(),
};

const mockRoute = {
  snapshot: { paramMap: { get: jest.fn().mockReturnValue(null) } },
};

describe('EmployeeFormComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
      providers: [
        provideRouter([]),
        MessageService,
        { provide: EmployeeService, useValue: mockSvc    },
        { provide: Store,           useValue: mockStore  },
        { provide: ActivatedRoute,  useValue: mockRoute  },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isEditMode defaults to false', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.isEditMode()).toBe(false);
  });

  it('genderOptions has 4 entries', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    expect(fixture.componentInstance.genderOptions).toHaveLength(4);
  });

  it('form is invalid when empty after init', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('hasError returns false for untouched field', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.hasError('firstName')).toBe(false);
  });

  it('hasError returns true when field is touched and invalid', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.get('firstName')?.markAsTouched();
    expect(fixture.componentInstance.hasError('firstName')).toBe(true);
  });

  it('getError returns required message for empty required field', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.get('firstName')?.markAsTouched();
    expect(fixture.componentInstance.getError('firstName')).toBe('This field is required.');
  });

  it('getError returns email message for invalid email', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.get('email')?.setValue('bad');
    fixture.componentInstance.form.get('email')?.markAsTouched();
    expect(fixture.componentInstance.getError('email')).toBe('Enter a valid email address.');
  });

  it('loads employee when id is present in route', () => {
    mockRoute.snapshot.paramMap.get.mockReturnValue('5');
    mockSvc.getById.mockReturnValue(of({
      id: 5, firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com',
      profileImageUrl: null, profileImageFileName: null,
      resumeUrl: null, resumeFileName: null,
      isRemote: false,
    }));
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.employeeId()).toBe(5);
    expect(mockSvc.getById).toHaveBeenCalledWith(5);
  });

  it('onSubmit marks all fields touched when form is invalid', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.form.touched).toBe(true);
    expect(mockSvc.create).not.toHaveBeenCalled();
  });
});
