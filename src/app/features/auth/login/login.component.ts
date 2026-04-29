import { Component, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Password } from 'primeng/password';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';

import { authActions }                  from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Button, Card, Password, InputText, Message],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss',
})
export class LoginComponent {
  private readonly fb    = inject(FormBuilder);
  private readonly store = inject(Store);

  readonly loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  readonly error   = toSignal(this.store.select(selectAuthError),   { initialValue: null });

  form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.valid) {
      this.store.dispatch(authActions.login({ request: this.form.getRawValue() }));
    } else {
      this.form.markAllAsTouched();
    }
  }

  isInvalid(field: 'email' | 'password'): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && ctrl.touched;
  }
}
