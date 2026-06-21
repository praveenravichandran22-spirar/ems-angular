import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SimListComponent } from './sim-list.component';
import { SimEmployeeService } from '../../core/services/sim-employee.service';
import { PagedResponse } from '../../core/models/employee.model';
import { SimEmployee } from '../../core/models/sim-employee.model';

const mockEmployee = { id: 1, firstName: 'Alice', lastName: 'Smith' } as SimEmployee;
const mockPage: PagedResponse<SimEmployee> = {
  content: [mockEmployee], totalElements: 1, totalPages: 1, page: 0, size: 25, last: true,
};
const emptyPage: PagedResponse<SimEmployee> = {
  content: [], totalElements: 0, totalPages: 0, page: 0, size: 25, last: true,
};

const mockSvc = { search: jest.fn() };

describe('SimListComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockSvc.search.mockReturnValue(of(mockPage));
    await TestBed.configureTestingModule({
      imports: [SimListComponent],
      providers: [{ provide: SimEmployeeService, useValue: mockSvc }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load employees on init', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.employees()).toEqual([mockEmployee]);
    expect(fixture.componentInstance.totalElements()).toBe(1);
  });

  it('loading is false after successful load', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.load();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('loading is false after error', () => {
    mockSvc.search.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.load();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('departmentOptions has 8 entries', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    expect(fixture.componentInstance.departmentOptions).toHaveLength(8);
  });

  it('statusOptions has 5 entries', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    expect(fixture.componentInstance.statusOptions).toHaveLength(5);
  });

  it('onKeywordChange sets keyword and triggers search$', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.onKeywordChange('alice');
    expect(fixture.componentInstance.keyword).toBe('alice');
  });

  it('onFilterChange resets page to 0 and reloads', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.params.page = 3;
    fixture.componentInstance.onFilterChange();
    expect(fixture.componentInstance.params.page).toBe(0);
    expect(mockSvc.search).toHaveBeenCalled();
  });

  it('onClear resets all filters and reloads', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.keyword      = 'test';
    fixture.componentInstance.deptFilter   = 'Engineering';
    fixture.componentInstance.statusFilter = 'Active';
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance.keyword).toBe('');
    expect(fixture.componentInstance.deptFilter).toBe('');
    expect(fixture.componentInstance.statusFilter).toBe('');
  });

  it('onPage updates params page and size', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.onPage({ first: 50, rows: 25 });
    expect(fixture.componentInstance.params.page).toBe(2);
    expect(fixture.componentInstance.params.size).toBe(25);
  });

  it('onSort updates sortBy and sortDir asc', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.onSort({ field: 'lastName', order: 1 });
    expect(fixture.componentInstance.params.sortBy).toBe('lastName');
    expect(fixture.componentInstance.params.sortDir).toBe('asc');
  });

  it('onSort updates sortDir desc when order is -1', () => {
    const fixture = TestBed.createComponent(SimListComponent);
    fixture.componentInstance.onSort({ field: 'email', order: -1 });
    expect(fixture.componentInstance.params.sortDir).toBe('desc');
  });

  describe('getStatusSeverity', () => {
    let comp: SimListComponent;
    beforeEach(() => {
      comp = TestBed.createComponent(SimListComponent).componentInstance;
    });

    it('returns secondary for null', () => expect(comp.getStatusSeverity(null)).toBe('secondary'));
    it('returns success for Active',     () => expect(comp.getStatusSeverity('Active')).toBe('success'));
    it('returns warn for Probation',     () => expect(comp.getStatusSeverity('Probation')).toBe('warn'));
    it('returns danger for Terminated',  () => expect(comp.getStatusSeverity('Terminated')).toBe('danger'));
    it('returns danger for Resigned',    () => expect(comp.getStatusSeverity('Resigned')).toBe('danger'));
    it('returns info for On Leave',      () => expect(comp.getStatusSeverity('On Leave')).toBe('info'));
    it('returns secondary for unknown',  () => expect(comp.getStatusSeverity('Unknown')).toBe('secondary'));
  });
});
