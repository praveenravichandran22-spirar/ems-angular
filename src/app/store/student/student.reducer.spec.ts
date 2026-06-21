import { studentFeature } from './student.reducer';
import { studentActions } from './student.actions';
import { Student } from '../../core/models/student.model';
import { PagedResponse } from '../../core/models/employee.model';

const reducer = studentFeature.reducer;

const mockStudent = { id: 1, firstName: 'Alice', lastName: 'Brown', email: 'alice@student.com' } as Student;
const mockPage: PagedResponse<Student> = {
  content: [mockStudent],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 10,
  last: true,
};
const baseParams = { page: 0, size: 10, sortBy: 'firstName' as const, sortDir: 'asc' as const };

describe('StudentReducer', () => {
  it('returns initial state', () => {
    const s = reducer(undefined, { type: '@@INIT' } as any);
    expect(s.students).toEqual([]);
    expect(s.loading).toBe(false);
    expect(s.totalElements).toBe(0);
    expect(s.error).toBeNull();
  });

  it('load sets loading true and clears error', () => {
    const s = reducer(undefined, studentActions.load({ params: baseParams }));
    expect(s.loading).toBe(true);
    expect(s.error).toBeNull();
  });

  it('loadSuccess populates students', () => {
    const s = reducer(undefined, studentActions.loadSuccess({ data: mockPage }));
    expect(s.students).toEqual([mockStudent]);
    expect(s.totalElements).toBe(1);
    expect(s.totalPages).toBe(1);
    expect(s.loading).toBe(false);
  });

  it('loadFailure sets error and clears loading', () => {
    const loading = reducer(undefined, studentActions.load({ params: baseParams }));
    const s = reducer(loading, studentActions.loadFailure({ error: 'Failed' }));
    expect(s.error).toBe('Failed');
    expect(s.loading).toBe(false);
  });

  it('deleteSuccess removes student and decrements total', () => {
    const loaded = reducer(undefined, studentActions.loadSuccess({ data: mockPage }));
    const s = reducer(loaded, studentActions.deleteSuccess({ id: 1 }));
    expect(s.students).toEqual([]);
    expect(s.totalElements).toBe(0);
  });

  it('setParams merges partial params', () => {
    const s = reducer(undefined, studentActions.setParams({ params: { keyword: 'bob', page: 1 } }));
    expect(s.params.keyword).toBe('bob');
    expect(s.params.page).toBe(1);
    expect(s.params.size).toBe(10);
  });
});
