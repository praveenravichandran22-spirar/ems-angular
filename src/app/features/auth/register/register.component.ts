import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Password } from 'primeng/password';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';

import { authActions }                           from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError }     from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Button, Card, Password, InputText, Select, Message],
  templateUrl: './register.component.html',
  styleUrl:    '../login/login.component.scss',
})
export class RegisterComponent {
  private readonly fb    = inject(FormBuilder);
  private readonly store = inject(Store);

  readonly loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  readonly error   = toSignal(this.store.select(selectAuthError),   { initialValue: null });

  readonly roleOptions = [
    { label: 'Admin',       value: 'ROLE_ADMIN' },
    { label: 'Regular User', value: 'ROLE_USER'  },
  ];

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    role:      ['ROLE_USER', Validators.required],
  });

  submit(): void {
    if (this.form.valid) {
      this.store.dispatch(authActions.register({ request: this.form.getRawValue() as any }));
    } else {
      this.form.markAllAsTouched();
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && ctrl.touched;
  }
}
