import { TestBed } from '@angular/core/testing';
import { DepartmentListComponent } from './department-list.component';

describe('DepartmentListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentListComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DepartmentListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render placeholder text', () => {
    const fixture = TestBed.createComponent(DepartmentListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Departments');
  });
});
