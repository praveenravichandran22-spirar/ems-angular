import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('isLoading is false initially', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('isLoading is true after increment', () => {
    service.increment();
    expect(service.isLoading()).toBe(true);
  });

  it('isLoading is false after increment then decrement', () => {
    service.increment();
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });

  it('decrement below zero clamps to zero and stays false', () => {
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });

  it('isLoading stays true while multiple requests are pending', () => {
    service.increment();
    service.increment();
    service.decrement();
    expect(service.isLoading()).toBe(true);
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });
});
