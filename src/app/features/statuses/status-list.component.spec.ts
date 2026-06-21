import { TestBed } from '@angular/core/testing';
import { StatusListComponent } from './status-list.component';

describe('StatusListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusListComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StatusListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render placeholder text', () => {
    const fixture = TestBed.createComponent(StatusListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Statuses');
  });
});
