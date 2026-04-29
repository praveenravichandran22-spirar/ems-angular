import { createSelector } from '@ngrx/store';
import { employeeFeature } from './employee.reducer';

export const {
  selectEmployees,
  selectTotalElements,
  selectTotalPages,
  selectLoading,
  selectError,
  selectParams,
} = employeeFeature;

export const selectEmployeeCount = createSelector(
  selectTotalElements,
  total => total,
);
