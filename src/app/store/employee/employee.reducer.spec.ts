import { employeeFeature } from './employee.reducer';
import { employeeActions } from './employee.actions';
import { Employee, PagedResponse } from '../../core/models/employee.model';

const reducer = employeeFeature.reducer;

const mockEmployee = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com' } as Employee;
const mockPage: PagedResponse<Employee> = {
  content: [mockEmployee],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 10,
  last: true,
};
const baseParams = { page: 0, size: 10, sortBy: 'firstName' as const, sortDir: 'asc' as const };

describe('EmployeeReducer', () => {
  it('returns initial state', () => {
    const s = reducer(undefined, { type: '@@INIT' } as any);
    expect(s.employees).toEqual([]);
    expect(s.loading).toBe(false);
    expect(s.totalElements).toBe(0);
    expect(s.error).toBeNull();
  });

  it('load sets loading true and clears error', () => {
    const s = reducer(undefined, employeeActions.load({ params: baseParams }));
    expect(s.loading).toBe(true);
    expect(s.error).toBeNull();
  });

  it('loadSuccess populates employees', () => {
    const s = reducer(undefined, employeeActions.loadSuccess({ data: mockPage }));
    expect(s.employees).toEqual([mockEmployee]);
    expect(s.totalElements).toBe(1);
    expect(s.totalPages).toBe(1);
    expect(s.loading).toBe(false);
  });

  it('loadFailure sets error and clears loading', () => {
    const loading = reducer(undefined, employeeActions.load({ params: baseParams }));
    const s = reducer(loading, employeeActions.loadFailure({ error: 'Network error' }));
    expect(s.error).toBe('Network error');
    expect(s.loading).toBe(false);
  });

  it('deleteSuccess removes employee and decrements total', () => {
    const loaded = reducer(undefined, employeeActions.loadSuccess({ data: mockPage }));
    const s = reducer(loaded, employeeActions.deleteSuccess({ id: 1 }));
    expect(s.employees).toEqual([]);
    expect(s.totalElements).toBe(0);
  });

  it('deleteSuccess ignores id that does not exist', () => {
    const loaded = reducer(undefined, employeeActions.loadSuccess({ data: mockPage }));
    const s = reducer(loaded, employeeActions.deleteSuccess({ id: 999 }));
    expect(s.employees).toHaveLength(1);
    expect(s.totalElements).toBe(0);
  });

  it('setParams merges partial params', () => {
    const s = reducer(undefined, employeeActions.setParams({ params: { keyword: 'jane', page: 2 } }));
    expect(s.params.keyword).toBe('jane');
    expect(s.params.page).toBe(2);
    expect(s.params.size).toBe(10);
  });
});
