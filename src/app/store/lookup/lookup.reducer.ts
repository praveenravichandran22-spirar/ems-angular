import { createFeature, createReducer, on } from '@ngrx/store';
import { Department } from '../../core/models/department.model';
import { EmploymentStatus } from '../../core/models/status.model';
import { lookupActions } from './lookup.actions';
import { Country } from '../../core/models/country.model';

interface LookupState {
  departments: Department[];
  statuses:    EmploymentStatus[];
  countries:   Country[];
  loaded:      boolean;
}

const initialState: LookupState = {
  departments: [],
  statuses:    [],
  countries:   [],
  loaded:      false,
};

export const lookupFeature = createFeature({
  name: 'lookup',
  reducer: createReducer(
    initialState,
    on(lookupActions.loadDepartmentsSuccess, (state, { departments }) => ({ ...state, departments })),
    on(lookupActions.loadStatusesSuccess,    (state, { statuses })    => ({ ...state, statuses, loaded: true })),
    on(lookupActions.loadCountriesSuccess,   (state, { countries })   => ({ ...state, countries })),
  ),
});
