import { createFeature, createReducer, on } from '@ngrx/store';
import { Employee, EmployeeSearchParams, PagedResponse } from '../../core/models/employee.model';
import { PAGINATION_DEFAULTS } from '../../core/constants/app.constants';
import { employeeActions } from './employee.actions';

interface EmployeeState {
  employees:     Employee[];
  totalElements: number;
  totalPages:    number;
  loading:       boolean;
  error:         string | null;
  params:        EmployeeSearchParams;
}

const initialState: EmployeeState = {
  employees:     [],
  totalElements: 0,
  totalPages:    0,
  loading:       false,
  error:         null,
  params: {
    page:    0,
    size:    PAGINATION_DEFAULTS.size,
    sortBy:  'firstName',
    sortDir: 'asc',
  },
};

export const employeeFeature = createFeature({
  name: 'employee',
  reducer: createReducer(
    initialState,

    on(employeeActions.load, state => ({ ...state, loading: true, error: null })),

    on(employeeActions.loadSuccess, (state, { data }) => ({
      ...state,
      loading:       false,
      employees:     data.content,
      totalElements: data.totalElements,
      totalPages:    data.totalPages,
    })),

    on(employeeActions.loadFailure, (state, { error }) => ({
      ...state, loading: false, error,
    })),

    on(employeeActions.deleteSuccess, (state, { id }) => ({
      ...state,
      employees:     state.employees.filter(e => e.id !== id),
      totalElements: state.totalElements - 1,
    })),

    on(employeeActions.setParams, (state, { params }) => ({
      ...state,
      params: { ...state.params, ...params },
    })),
  ),
});
