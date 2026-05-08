import { Component, OnInit, inject, signal } from '@angular/core';
import { concat, Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

import { Button }          from 'primeng/button';
import { InputText }       from 'primeng/inputtext';
import { Textarea }        from 'primeng/textarea';
import { Select }          from 'primeng/select';
import { DatePicker }      from 'primeng/datepicker';
import { InputNumber }     from 'primeng/inputnumber';
import { ToggleSwitch }    from 'primeng/toggleswitch';
import { RadioButton }     from 'primeng/radiobutton';
import { Divider }         from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';

import { StudentService }            from '../../../core/services/student.service';
import { Student, StudentRequest }   from '../../../core/models/student.model';
import { resolveFileUrl }            from '../../../core/constants/api.constants';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    Button, InputText, Textarea, Select, DatePicker,
    InputNumber, ToggleSwitch, RadioButton, Divider, ProgressSpinner,
  ],
  templateUrl: './student-form.component.html',
  styleUrl:    './student-form.component.scss',
})
export class StudentFormComponent implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc    = inject(StudentService);
  private readonly toast  = inject(MessageService);

  readonly isEditMode      = signal(false);
  readonly studentId       = signal<number | null>(null);
  readonly saving          = signal(false);
  readonly loadingStudent  = signal(false);

  readonly currentProfileImageUrl = signal<string | null>(null);
  selectedProfileImage: File | null = null;
  readonly uploadingImage = signal(false);
  profileImageFileName = '';

  readonly genderOptions = [
    { label: 'Male',              value: 'MALE' },
    { label: 'Female',            value: 'FEMALE' },
    { label: 'Other',             value: 'OTHER' },
    { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
  ];

  readonly yearOptions = [
    { label: '1st Year', value: 1 },
    { label: '2nd Year', value: 2 },
    { label: '3rd Year', value: 3 },
    { label: '4th Year', value: 4 },
  ];

  readonly maxDob = new Date(
    new Date().getFullYear() - 10,
    new Date().getMonth(),
    new Date().getDate()
  );

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName:        ['', [Validators.required, Validators.maxLength(50)]],
      lastName:         ['', [Validators.required, Validators.maxLength(50)]],
      email:            ['', [Validators.required, Validators.email]],
      enrollmentNumber: ['', Validators.required],
      phone:            [null as string | null, Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)],
      gender:           [null],
      dateOfBirth:      [null as Date | null],
      course:           ['', [Validators.required, Validators.minLength(3)]],
      year:             [null as number | null],
      gpa:              [null as number | null],
      enrollmentDate:   [null as Date | null, Validators.required],
      isActive:         [true],
      address:          [null as string | null],
      guardianName:     [null as string | null,], 
      bio:              [null as string | null],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.studentId.set(+id);
      this.loadStudent(+id);
    }
  }

  private loadStudent(id: number): void {
    this.loadingStudent.set(true);
    this.svc.getById(id).subscribe({
      next: s => {
        this.currentProfileImageUrl.set(resolveFileUrl(s.profileImageUrl));
        this.form.patchValue({
          firstName:        s.firstName,
          lastName:         s.lastName,
          email:            s.email,
          enrollmentNumber: s.enrollmentNumber,
          phone:            s.phone,
          gender:           s.gender,
          dateOfBirth:      s.dateOfBirth      ? new Date(s.dateOfBirth)     : null,
          course:           s.course,
          year:             s.year,
          gpa:              s.gpa,
          enrollmentDate:   s.enrollmentDate   ? new Date(s.enrollmentDate)  : null,
          isActive:         s.isActive,
          address:          s.address,
          guardianName:     s.guardianName,
          bio:              s.bio,
        });
        this.loadingStudent.set(false);
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Student not found.' });
        this.loadingStudent.set(false);
        this.router.navigate(['/students']);
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
    const payload: StudentRequest = {
      firstName:        v.firstName,
      lastName:         v.lastName,
      email:            v.email,
      enrollmentNumber: v.enrollmentNumber,
      phone:            v.phone    || null,
      gender:           v.gender   || null,
      dateOfBirth:      this.toDateStr(v.dateOfBirth),
      course:           v.course,
      year:             v.year     ?? null,
      gpa:              v.gpa      ?? null,
      enrollmentDate:   this.toDateStr(v.enrollmentDate)!,
      isActive:         v.isActive ?? true,
      address:          v.address  || null,
      bio:              v.bio      || null,
      guardianName:     v.guardianName || null,
    };

    this.saving.set(true);
    const op$ = this.isEditMode()
      ? this.svc.update(this.studentId()!, payload)
      : this.svc.create(payload);

    op$.subscribe({
      next: s => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.isEditMode() ? 'Updated' : 'Created',
          detail:  `${s.firstName} ${s.lastName} ${this.isEditMode() ? 'updated' : 'created'} successfully.`,
        });
        if (!this.isEditMode() && this.selectedProfileImage) {
          this.autoUploadImage(s.id, () => this.router.navigate(['/students']));
        } else {
          this.router.navigate(['/students']);
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

  private autoUploadImage(studentId: number, onDone: () => void): void {
    if (!this.selectedProfileImage) { onDone(); return; }
    this.svc.uploadProfileImage(studentId, this.selectedProfileImage)
      .subscribe({ error: () => onDone(), complete: () => onDone() });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedProfileImage = input.files[0];
      this.profileImageFileName = input.files[0].name;
    }
  }

  uploadProfileImage(): void {
    if (!this.selectedProfileImage || !this.studentId()) return;
    this.uploadingImage.set(true);
    this.svc.uploadProfileImage(this.studentId()!, this.selectedProfileImage).subscribe({
      next: s => {
        this.uploadingImage.set(false);
        this.currentProfileImageUrl.set(resolveFileUrl(s.profileImageUrl));
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
    if (errors['pattern'])   return 'Enter a valid phone number.';
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