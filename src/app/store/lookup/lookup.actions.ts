import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Department } from '../../core/models/department.model';
import { EmploymentStatus } from '../../core/models/status.model';

export const lookupActions = createActionGroup({
  source: 'Lookup',
  events: {
    'Load':                   emptyProps(),
    'Load Departments Success': props<{ departments: Department[] }>(),
    'Load Statuses Success':   props<{ statuses: EmploymentStatus[] }>(),
    'Load Failure':            props<{ error: string }>(),
  },
});
