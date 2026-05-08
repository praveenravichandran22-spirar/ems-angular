import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { LookupService } from '../../core/services/lookup.service';
import { lookupActions } from './lookup.actions';

@Injectable()
export class LookupEffects {
  private readonly actions$ = inject(Actions);
  private readonly svc      = inject(LookupService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(lookupActions.load),
      switchMap(() =>
        forkJoin([this.svc.getDepartments(), this.svc.getStatuses(), this.svc.getCountries()]).pipe(
          map(([departments, statuses, countries]) => [
            lookupActions.loadDepartmentsSuccess({ departments }),
            lookupActions.loadStatusesSuccess({ statuses }),
            lookupActions.loadCountriesSuccess({ countries }),
          ]),
          catchError(err => of([lookupActions.loadFailure({ error: err.message ?? 'Lookup load failed' })]))
        )
      ),
      switchMap(actions => actions)
    )
  );
}
