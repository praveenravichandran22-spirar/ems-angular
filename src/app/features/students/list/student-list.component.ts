import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';

import { studentActions }                                          from '../../../store/student/student.actions';
import { selectStudents, selectLoading, selectParams, selectTotalElements } from '../../../store/student/student.selectors';
import { selectIsAdmin }                                           from '../../../store/auth/auth.selectors';
import { resolveFileUrl }                                          from '../../../core/constants/api.constants';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, FormsModule, RouterLink, TableModule, Button, InputText, Select, Tag, Avatar, ConfirmDialog, IconField, InputIcon, Tooltip],
  templateUrl: './student-list.component.html',
  styleUrl:    './student-list.component.scss',
})
export class StudentListComponent implements OnInit {
  private readonly store      = inject(Store);
  private readonly router     = inject(Router);
  private readonly confirm    = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchSubject = new Subject<string>();

  readonly students = toSignal(this.store.select(selectStudents),      { initialValue: [] });
  readonly total    = toSignal(this.store.select(selectTotalElements),  { initialValue: 0 });
  readonly loading  = toSignal(this.store.select(selectLoading),        { initialValue: false });
  readonly params   = toSignal(this.store.select(selectParams),         { initialValue: { page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc' as const } });
  readonly isAdmin  = toSignal(this.store.select(selectIsAdmin),        { initialValue: false });

  keyword     = '';
  courseFilter = '';
  yearFilter: number | null = null;
  genderFilter: string | null = null;

  readonly yearOptions = [
    { label: 'All Years', value: null },
    { label: '1st Year',  value: 1 },
    { label: '2nd Year',  value: 2 },
    { label: '3rd Year',  value: 3 },
    { label: '4th Year',  value: 4 },
  ];
  
  readonly genderOptions = [
    { label: 'All Genders', value: null },
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' },
  ];

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.store.dispatch(studentActions.setParams({ params: { page: 0 } }));
      this.loadStudents();
    });
    this.loadStudents();
  }

  onKeywordChange(value: string): void {
    this.keyword = value;
    this.searchSubject.next(value);
  }

  private buildParams() {
    const p = this.params();
    return {
      ...p,
      keyword: this.keyword    || undefined,
      course:  this.courseFilter || undefined,
      year:    this.yearFilter  ?? undefined,
      gender:  this.genderFilter ?? undefined,
    };
  }

  loadStudents(): void {
    this.store.dispatch(studentActions.load({ params: this.buildParams() }));
  }

  onSearch(): void {
    this.store.dispatch(studentActions.setParams({ params: { page: 0 } }));
    this.loadStudents();
  }

  onClear(): void {
    this.keyword      = '';
    this.courseFilter = '';
    this.yearFilter   = null;
    this.genderFilter = null;
    this.searchSubject.next('');
    this.store.dispatch(studentActions.setParams({ params: { page: 0 } }));
    this.loadStudents();
  }

  onPage(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows);
    this.store.dispatch(studentActions.load({ params: {
      ...this.buildParams(), page, size: event.rows,
    }}));
  }

  onSort(event: { field: string; order: number }): void {
    const sortDir = event.order === 1 ? 'asc' : 'desc';
    this.store.dispatch(studentActions.load({ params: {
      ...this.buildParams(), sortBy: event.field, sortDir,
    }}));
  }

  editStudent(id: number): void {
    this.router.navigate(['/students', id, 'edit']);
  }

  deleteStudent(id: number, name: string): void {
    this.confirm.confirm({
      message: `Delete ${name}? This cannot be undone.`,
      header:  'Confirm Delete',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => this.store.dispatch(studentActions.delete({ id })),
    });
  }

  getInitials(first: string, last: string): string {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  getGpaColor(gpa: number | null): 'success' | 'warn' | 'danger' | 'secondary' {
    if (gpa == null) return 'secondary';
    if (gpa >= 3.5)  return 'success';
    if (gpa >= 2.5)  return 'warn';
    return 'danger';
  }

  resolveFileUrl = resolveFileUrl;
}