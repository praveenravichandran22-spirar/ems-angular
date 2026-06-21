import { selectEmployees, selectTotalElements, selectTotalPages, selectLoading, selectError, selectParams, selectEmployeeCount } from './employee.selectors';

const state = {
  employee: {
    employees:     [{ id: 1, firstName: 'Alice' } as any],
    totalElements: 42,
    totalPages:    5,
    loading:       true,
    error:         'oops',
    params:        { page: 0, size: 10, sortBy: 'firstName', sortDir: 'asc' },
  },
};

describe('Employee selectors', () => {
  it('selectEmployees returns employee list', () => {
    expect(selectEmployees(state as any)).toEqual(state.employee.employees);
  });

  it('selectTotalElements returns total count', () => {
    expect(selectTotalElements(state as any)).toBe(42);
  });

  it('selectTotalPages returns page count', () => {
    expect(selectTotalPages(state as any)).toBe(5);
  });

  it('selectLoading returns loading flag', () => {
    expect(selectLoading(state as any)).toBe(true);
  });

  it('selectError returns error message', () => {
    expect(selectError(state as any)).toBe('oops');
  });

  it('selectParams returns query params', () => {
    expect(selectParams(state as any)).toEqual(state.employee.params);
  });

  it('selectEmployeeCount derives count from totalElements', () => {
    expect(selectEmployeeCount(state as any)).toBe(42);
  });
});
