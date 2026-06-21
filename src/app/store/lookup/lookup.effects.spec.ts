import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { LookupEffects } from './lookup.effects';
import { lookupActions } from './lookup.actions';
import { LookupService } from '../../core/services/lookup.service';

const mockDepts     = [{ id: 1, name: 'HR' }];
const mockStatuses  = [{ id: 1, name: 'Active' }];
const mockCountries = [{ id: 1, countryName: 'India' }];

describe('LookupEffects', () => {
  let actions$: Observable<Action>;
  let effects: LookupEffects;
  let mockSvc: { getDepartments: jest.Mock; getStatuses: jest.Mock; getCountries: jest.Mock };

  beforeEach(() => {
    mockSvc = {
      getDepartments: jest.fn(),
      getStatuses:    jest.fn(),
      getCountries:   jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        LookupEffects,
        provideMockActions(() => actions$),
        { provide: LookupService, useValue: mockSvc },
      ],
    });
    effects = TestBed.inject(LookupEffects);
  });

  it('dispatches three success actions on successful load', done => {
    mockSvc.getDepartments.mockReturnValue(of(mockDepts));
    mockSvc.getStatuses.mockReturnValue(of(mockStatuses));
    mockSvc.getCountries.mockReturnValue(of(mockCountries));

    actions$ = of(lookupActions.load());
    const dispatched: Action[] = [];

    effects.load$.subscribe({
      next: action => dispatched.push(action),
      complete: () => {
        expect(dispatched).toContainEqual(lookupActions.loadDepartmentsSuccess({ departments: mockDepts } as any));
        expect(dispatched).toContainEqual(lookupActions.loadStatusesSuccess({ statuses: mockStatuses } as any));
        expect(dispatched).toContainEqual(lookupActions.loadCountriesSuccess({ countries: mockCountries } as any));
        done();
      },
    });
  });

  it('dispatches loadFailure when forkJoin fails', done => {
    mockSvc.getDepartments.mockReturnValue(throwError(() => ({ message: 'Network error' })));
    mockSvc.getStatuses.mockReturnValue(of(mockStatuses));
    mockSvc.getCountries.mockReturnValue(of(mockCountries));

    actions$ = of(lookupActions.load());

    effects.load$.subscribe(action => {
      expect(action).toEqual(lookupActions.loadFailure({ error: 'Network error' }));
      done();
    });
  });

  it('uses default error message when error has no message', done => {
    mockSvc.getDepartments.mockReturnValue(throwError(() => ({})));
    mockSvc.getStatuses.mockReturnValue(of(mockStatuses));
    mockSvc.getCountries.mockReturnValue(of(mockCountries));

    actions$ = of(lookupActions.load());

    effects.load$.subscribe(action => {
      expect(action).toEqual(lookupActions.loadFailure({ error: 'Lookup load failed' }));
      done();
    });
  });
});
