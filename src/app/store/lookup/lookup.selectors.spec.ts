import { selectDepartments, selectStatuses, selectCountries, selectLoaded } from './lookup.selectors';

const state = {
  lookup: {
    departments: [{ id: 1, name: 'Engineering' }],
    statuses:    [{ id: 1, name: 'Active' }],
    countries:   [{ id: 1, countryName: 'India' }],
    loaded:      true,
  },
};

describe('Lookup selectors', () => {
  it('selectDepartments returns department list', () => {
    expect(selectDepartments(state as any)).toEqual(state.lookup.departments);
  });

  it('selectStatuses returns status list', () => {
    expect(selectStatuses(state as any)).toEqual(state.lookup.statuses);
  });

  it('selectCountries returns country list', () => {
    expect(selectCountries(state as any)).toEqual(state.lookup.countries);
  });

  it('selectLoaded returns loaded flag', () => {
    expect(selectLoaded(state as any)).toBe(true);
  });
});
