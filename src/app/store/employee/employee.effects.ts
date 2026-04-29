import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EmployeeService } from '../../core/services/employee.service';
import { employeeActions } from './employee.actions';

@Injectable()
export class EmployeeEffects {
  private readonly actions$ = inject(Actions);
  private readonly svc      = inject(EmployeeService);
  private readonly toast    = inject(MessageService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(employeeActions.load),
      switchMap(({ params }) =>
        this.svc.search(params).pipe(
          map(data => employeeActions.loadSuccess({ data })),
          catchError(err => of(employeeActions.loadFailure({ error: err.message ?? 'Failed to load employees' })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(employeeActions.delete),
      switchMap(({ id }) =>
        this.svc.delete(id).pipe(
          map(() => employeeActions.deleteSuccess({ id })),
          catchError(err => of(employeeActions.deleteFailure({ error: err.message ?? 'Delete failed' })))
        )
      )
    )
  );

  deleteSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(employeeActions.deleteSuccess),
      tap(() => this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Employee removed.' }))
    ),
  { dispatch: false });

  deleteFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(employeeActions.deleteFailure),
      tap(({ error }) => this.toast.add({ severity: 'error', summary: 'Error', detail: error }))
    ),
  { dispatch: false });
}
