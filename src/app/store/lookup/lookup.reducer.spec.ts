import { lookupFeature } from './lookup.reducer';
import { lookupActions } from './lookup.actions';

const reducer = lookupFeature.reducer;

describe('LookupReducer', () => {
  it('returns initial state', () => {
    const s = reducer(undefined, { type: '@@INIT' } as any);
    expect(s.departments).toEqual([]);
    expect(s.statuses).toEqual([]);
    expect(s.countries).toEqual([]);
    expect(s.loaded).toBe(false);
  });

  it('loadDepartmentsSuccess sets departments', () => {
    const departments = [{ id: 1, name: 'HR' }, { id: 2, name: 'IT' }];
    const s = reducer(undefined, lookupActions.loadDepartmentsSuccess({ departments } as any));
    expect(s.departments).toEqual(departments);
  });

  it('loadStatusesSuccess sets statuses and marks loaded=true', () => {
    const statuses = [{ id: 1, name: 'Active' }];
    const s = reducer(undefined, lookupActions.loadStatusesSuccess({ statuses } as any));
    expect(s.statuses).toEqual(statuses);
    expect(s.loaded).toBe(true);
  });

  it('loadCountriesSuccess sets countries', () => {
    const countries = [{ id: 1, countryName: 'India' }, { id: 2, countryName: 'USA' }];
    const s = reducer(undefined, lookupActions.loadCountriesSuccess({ countries } as any));
    expect(s.countries).toEqual(countries);
  });

  it('loaded stays false after departments and countries load (only statuses sets it)', () => {
    const s1 = reducer(undefined, lookupActions.loadDepartmentsSuccess({ departments: [] } as any));
    const s2 = reducer(s1, lookupActions.loadCountriesSuccess({ countries: [] } as any));
    expect(s2.loaded).toBe(false);
  });
});
