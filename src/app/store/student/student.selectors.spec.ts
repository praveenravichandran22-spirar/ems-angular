import { selectStudents, selectTotalElements, selectTotalPages, selectLoading, selectError, selectParams } from './student.selectors';

const state = {
  student: {
    students:      [{ id: 1, firstName: 'Bob' } as any],
    totalElements: 20,
    totalPages:    2,
    loading:       false,
    error:         null,
    params:        { page: 1, size: 10, sortBy: 'firstName', sortDir: 'desc' },
  },
};

describe('Student selectors', () => {
  it('selectStudents returns student list', () => {
    expect(selectStudents(state as any)).toEqual(state.student.students);
  });

  it('selectTotalElements returns total count', () => {
    expect(selectTotalElements(state as any)).toBe(20);
  });

  it('selectTotalPages returns page count', () => {
    expect(selectTotalPages(state as any)).toBe(2);
  });

  it('selectLoading returns loading flag', () => {
    expect(selectLoading(state as any)).toBe(false);
  });

  it('selectError returns error value', () => {
    expect(selectError(state as any)).toBeNull();
  });

  it('selectParams returns query params', () => {
    expect(selectParams(state as any)).toEqual(state.student.params);
  });
});
