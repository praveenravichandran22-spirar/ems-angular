import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UnauthorizedComponent } from './unauthorized.component';

describe('UnauthorizedComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UnauthorizedComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render Access Denied heading', () => {
    const fixture = TestBed.createComponent(UnauthorizedComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Access Denied');
  });

  it('should render permission message', () => {
    const fixture = TestBed.createComponent(UnauthorizedComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain("You don't have permission to view this page.");
  });
});
