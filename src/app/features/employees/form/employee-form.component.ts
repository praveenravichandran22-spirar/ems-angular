import { Component, OnInit, inject, signal } from '@angular/core';
import { concat, Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { Button }       from 'primeng/button';
import { InputText }    from 'primeng/inputtext';
import { Textarea }     from 'primeng/textarea';
import { Select }       from 'primeng/select';
import { DatePicker }   from 'primeng/datepicker';
import { InputNumber }  from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Rating }       from 'primeng/rating';
import { RadioButton }  from 'primeng/radiobutton';
import { Divider }      from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';

import { selectDepartments, selectStatuses } from '../../../store/lookup/lookup.selectors';
import { EmployeeService }                   from '../../../core/services/employee.service';
import { Employee, EmployeeRequest }         from '../../../core/models/employee.model';
import { resolveFileUrl }                    from '../../../core/constants/api.constants';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    Button, InputText, Textarea, Select, DatePicker,
    InputNumber, ToggleSwitch, Rating, RadioButton, Divider, ProgressSpinner,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl:    './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc    = inject(EmployeeService);
  private readonly store  = inject(Store);
  private readonly toast  = inject(MessageService);

  readonly departments = toSignal(this.store.select(selectDepartments), { initialValue: [] });
  readonly statuses    = toSignal(this.store.select(selectStatuses),    { initialValue: [] });

  readonly isEditMode      = signal(false);
  readonly employeeId      = signal<number | null>(null);
  readonly saving          = signal(false);
  readonly loadingEmployee = signal(false);

  readonly currentProfileImageUrl = signal<string | null>(null);
  readonly currentResumeUrl       = signal<string | null>(null);
  selectedProfileImage: File | null = null;
  selectedResume:       File | null = null;
  readonly uploadingImage  = signal(false);
  readonly uploadingResume = signal(false);
  profileImageFileName = '';
  resumeFileName       = '';

  readonly genderOptions = [
    { label: 'Male',              value: 'MALE' },
    { label: 'Female',            value: 'FEMALE' },
    { label: 'Other',             value: 'OTHER' },
    { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
  ];

  readonly maxDob = new Date(
    new Date().getFullYear() - 16,
    new Date().getMonth(),
    new Date().getDate()
  );

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName:       ['', [Validators.required, Validators.maxLength(50)]],
      lastName:        ['', [Validators.required, Validators.maxLength(50)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           [null as string | null, Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)],
      gender:          [null],
      dateOfBirth:     [null as Date | null],
      departmentId:    [null as number | null],
      statusId:        [null as number | null],
      joiningDate:     [null as Date | null, Validators.required],
      salary:          [null as number | null],
      experienceYears: [null as number | null],
      isRemote:        [false],
      address:         [null as string | null],
      bio:             [null as string | null],
      rating:          [null as number | null],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(+id);
      this.loadEmployee(+id);
    }
  }

  private loadEmployee(id: number): void {
    this.loadingEmployee.set(true);
    this.svc.getById(id).subscribe({
      next: emp => {
        this.currentProfileImageUrl.set(resolveFileUrl(emp.profileImageUrl));
        this.currentResumeUrl.set(resolveFileUrl(emp.resumeUrl));
        this.form.patchValue({
          firstName:       emp.firstName,
          lastName:        emp.lastName,
          email:           emp.email,
          phone:           emp.phone,
          gender:          emp.gender,
          dateOfBirth:     emp.dateOfBirth     ? new Date(emp.dateOfBirth)  : null,
          departmentId:    emp.department?.id  ?? null,
          statusId:        emp.status?.id      ?? null,
          joiningDate:     emp.joiningDate     ? new Date(emp.joiningDate) : null,
          salary:          emp.salary,
          experienceYears: emp.experienceYears,
          isRemote:        emp.isRemote,
          address:         emp.address,
          bio:             emp.bio,
          rating:          emp.rating,
        });
        this.loadingEmployee.set(false);
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Employee not found.' });
        this.loadingEmployee.set(false);
        this.router.navigate(['/employees']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.add({
        severity: 'warn',
        summary: 'Validation Errors',
        detail: 'Please fix the highlighted fields before submitting.',
      });
      return;
    }

    const v = this.form.getRawValue();
    const payload: EmployeeRequest = {
      firstName:       v.firstName,
      lastName:        v.lastName,
      email:           v.email,
      phone:           v.phone  || null,
      gender:          v.gender || null,
      dateOfBirth:     this.toDateStr(v.dateOfBirth),
      departmentId:    v.departmentId || null,
      statusId:        v.statusId     || null,
      joiningDate:     this.toDateStr(v.joiningDate)!,
      salary:          v.salary          ?? null,
      experienceYears: v.experienceYears ?? null,
      isRemote:        v.isRemote        ?? false,
      address:         v.address || null,
      bio:             v.bio     || null,
      rating:          v.rating  ?? null,
    };

    this.saving.set(true);
    const op$ = this.isEditMode()
      ? this.svc.update(this.employeeId()!, payload)
      : this.svc.create(payload);

    op$.subscribe({
      next: emp => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.isEditMode() ? 'Updated' : 'Created',
          detail:  `${emp.firstName} ${emp.lastName} ${this.isEditMode() ? 'updated' : 'created'} successfully.`,
        });
        if (!this.isEditMode() && (this.selectedProfileImage || this.selectedResume)) {
          this.autoUploadFiles(emp.id, () => this.router.navigate(['/employees', emp.id]));
        } else {
          this.router.navigate(['/employees', emp.id]);
        }
      },
      error: err => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary:  'Error',
          detail:   err.error?.message ?? 'Operation failed. Please try again.',
        });
      },
    });
  }

  private autoUploadFiles(empId: number, onDone: () => void): void {
    const uploads: Observable<Employee>[] = [];
    if (this.selectedProfileImage) uploads.push(this.svc.uploadProfileImage(empId, this.selectedProfileImage));
    if (this.selectedResume)       uploads.push(this.svc.uploadResume(empId, this.selectedResume));
    if (uploads.length === 0) { onDone(); return; }
    // concat runs uploads one after the other — prevents the lost-update race
    // where both transactions read the same row before either commits.
    concat(...uploads).subscribe({ error: () => onDone(), complete: () => onDone() });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedProfileImage  = input.files[0];
      this.profileImageFileName = input.files[0].name;
    }
  }

  onResumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedResume  = input.files[0];
      this.resumeFileName = input.files[0].name;
    }
  }

  uploadProfileImage(): void {
    if (!this.selectedProfileImage || !this.employeeId()) return;
    this.uploadingImage.set(true);
    this.svc.uploadProfileImage(this.employeeId()!, this.selectedProfileImage).subscribe({
      next: emp => {
        this.uploadingImage.set(false);
        this.currentProfileImageUrl.set(resolveFileUrl(emp.profileImageUrl));
        this.selectedProfileImage = null;
        this.profileImageFileName = '';
        this.toast.add({ severity: 'success', summary: 'Uploaded', detail: 'Profile image updated.' });
      },
      error: () => {
        this.uploadingImage.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image.' });
      },
    });
  }

  uploadResume(): void {
    if (!this.selectedResume || !this.employeeId()) return;
    this.uploadingResume.set(true);
    this.svc.uploadResume(this.employeeId()!, this.selectedResume).subscribe({
      next: emp => {
        this.uploadingResume.set(false);
        this.currentResumeUrl.set(resolveFileUrl(emp.resumeUrl));
        this.selectedResume  = null;
        this.resumeFileName = '';
        this.toast.add({ severity: 'success', summary: 'Uploaded', detail: 'Resume updated.' });
      },
      error: () => {
        this.uploadingResume.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload resume.' });
      },
    });
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getError(field: string): string {
    const errors = this.form.get(field)?.errors;
    if (!errors) return '';
    if (errors['required'])  return 'This field is required.';
    if (errors['email'])     return 'Enter a valid email address.';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters.`;
    if (errors['pattern'])   return 'Enter a valid phone number (digits, spaces, +, -, parentheses).';
    return 'Invalid value.';
  }

  private toDateStr(d: Date | null): string | null {
    if (!d) return null;
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}
