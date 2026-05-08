import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { StudentService } from '../../core/services/student.service';
import { studentActions } from './student.actions';

@Injectable()
export class StudentEffects {
  private readonly actions$ = inject(Actions);
  private readonly svc      = inject(StudentService);
  private readonly toast    = inject(MessageService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.load),
      switchMap(({ params }) =>
        this.svc.search(params).pipe(
          map(data => studentActions.loadSuccess({ data })),
          catchError(err => of(studentActions.loadFailure({ error: err.message ?? 'Failed to load students' })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.delete),
      switchMap(({ id }) =>
        this.svc.delete(id).pipe(
          map(() => studentActions.deleteSuccess({ id })),
          catchError(err => of(studentActions.deleteFailure({ error: err.message ?? 'Delete failed' })))
        )
      )
    )
  );

  deleteSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.deleteSuccess),
      tap(() => this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Student removed.' }))
    ),
  { dispatch: false });

  deleteFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.deleteFailure),
      tap(({ error }) => this.toast.add({ severity: 'error', summary: 'Error', detail: error }))
    ),
  { dispatch: false });
}