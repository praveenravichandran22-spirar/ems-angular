import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../../core/services/student.service';

const mockSvc = {
  getById:            jest.fn(),
  create:             jest.fn(),
  update:             jest.fn(),
  uploadProfileImage: jest.fn(),
};

const mockRoute = {
  snapshot: { paramMap: { get: jest.fn().mockReturnValue(null) } },
};

const mockRouter = { navigate: jest.fn() };

describe('StudentFormComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideRouter([]),
        MessageService,
        { provide: StudentService,  useValue: mockSvc    },
        { provide: ActivatedRoute,  useValue: mockRoute  },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isEditMode defaults to false', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.isEditMode()).toBe(false);
  });

  it('genderOptions has 4 entries', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    expect(fixture.componentInstance.genderOptions).toHaveLength(4);
  });

  it('yearOptions has 4 entries', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    expect(fixture.componentInstance.yearOptions).toHaveLength(4);
  });

  it('form is invalid when empty after init', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('hasError returns false for untouched field', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.hasError('firstName')).toBe(false);
  });

  it('hasError returns true when field is touched and invalid', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.get('firstName')?.markAsTouched();
    expect(fixture.componentInstance.hasError('firstName')).toBe(true);
  });

  it('getError returns required message for required field', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.get('firstName')?.markAsTouched();
    expect(fixture.componentInstance.getError('firstName')).toBe('This field is required.');
  });

  it('getError returns email message for invalid email', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.get('email')?.setValue('bad');
    fixture.componentInstance.form.get('email')?.markAsTouched();
    expect(fixture.componentInstance.getError('email')).toBe('Enter a valid email address.');
  });

  it('loads student data when id is present in route', () => {
    mockRoute.snapshot.paramMap.get.mockReturnValue('42');
    mockSvc.getById.mockReturnValue(of({
      id: 42, firstName: 'Alice', lastName: 'Smith', email: 'a@b.com',
      enrollmentNumber: 'EN001', phone: '1234567', gender: 'FEMALE',
      course: 'CS', isActive: true,
    }));
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.studentId()).toBe(42);
    expect(mockSvc.getById).toHaveBeenCalledWith(42);
  });

  it('onSubmit marks all fields touched when form is invalid', () => {
    const fixture = TestBed.createComponent(StudentFormComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.form.touched).toBe(true);
    expect(mockSvc.create).not.toHaveBeenCalled();
  });
});
