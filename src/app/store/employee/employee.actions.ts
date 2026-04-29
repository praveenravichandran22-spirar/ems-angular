import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Employee, EmployeeSearchParams, PagedResponse } from '../../core/models/employee.model';

export const employeeActions = createActionGroup({
  source: 'Employee',
  events: {
    'Load':         props<{ params: EmployeeSearchParams }>(),
    'Load Success': props<{ data: PagedResponse<Employee> }>(),
    'Load Failure': props<{ error: string }>(),

    'Delete':         props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ error: string }>(),

    'Set Params': props<{ params: Partial<EmployeeSearchParams> }>(),
  },
});
