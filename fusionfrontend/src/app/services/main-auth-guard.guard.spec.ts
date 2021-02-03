import { TestBed } from '@angular/core/testing';

import { MainAuthGuardGuard } from './main-auth-guard.guard';

describe('MainAuthGuardGuard', () => {
  let guard: MainAuthGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({ });
    guard = TestBed.inject(MainAuthGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
