import { createFeature, createReducer, on } from '@ngrx/store';
import { Student, StudentSearchParams } from '../../core/models/student.model';
import { PAGINATION_DEFAULTS } from '../../core/constants/app.constants';
import { studentActions } from './student.actions';

interface StudentState {
  students:      Student[];
  totalElements: number;
  totalPages:    number;
  loading:       boolean;
  error:         string | null;
  params:        StudentSearchParams;
}

const initialState: StudentState = {
  students:      [],
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

export const studentFeature = createFeature({
  name: 'student',
  reducer: createReducer(
    initialState,

    on(studentActions.load, state => ({ ...state, loading: true, error: null })),

    on(studentActions.loadSuccess, (state, { data }) => ({
      ...state,
      loading:       false,
      students:      data.content,
      totalElements: data.totalElements,
      totalPages:    data.totalPages,
    })),

    on(studentActions.loadFailure, (state, { error }) => ({
      ...state, loading: false, error,
    })),

    on(studentActions.deleteSuccess, (state, { id }) => ({
      ...state,
      students:      state.students.filter(s => s.id !== id),
      totalElements: state.totalElements - 1,
    })),

    on(studentActions.setParams, (state, { params }) => ({
      ...state,
      params: { ...state.params, ...params },
    })),
  ),
});