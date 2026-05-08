import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Student, StudentSearchParams } from '../../core/models/student.model';
import { PagedResponse } from '../../core/models/employee.model';

export const studentActions = createActionGroup({
  source: 'Student',
  events: {
    'Load':         props<{ params: StudentSearchParams }>(),
    'Load Success': props<{ data: PagedResponse<Student> }>(),
    'Load Failure': props<{ error: string }>(),

    'Delete':         props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ error: string }>(),

    'Set Params': props<{ params: Partial<StudentSearchParams> }>(),
  },
});