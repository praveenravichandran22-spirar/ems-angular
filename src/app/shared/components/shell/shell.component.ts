import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';

import { authActions }  from '../../../store/auth/auth.actions';
import { selectIsAdmin, selectIsReviewer, selectIsApprover, selectFullName } from '../../../store/auth/auth.selectors';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Avatar, Divider, Toast],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly store   = inject(Store);
  readonly loading         = inject(LoadingService);

  readonly isAdmin    = toSignal(this.store.select(selectIsAdmin),    { initialValue: false });
  readonly isReviewer = toSignal(this.store.select(selectIsReviewer), { initialValue: false });
  readonly isApprover = toSignal(this.store.select(selectIsApprover), { initialValue: false });
  readonly fullName   = toSignal(this.store.select(selectFullName),   { initialValue: '' });

  logout(): void {
    this.store.dispatch(authActions.logout());
  }
}
