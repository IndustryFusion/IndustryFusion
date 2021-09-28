import { TestBed } from '@angular/core/testing';

import { MainAuthGuard } from './main-auth-guard.service';

describe('MainAuthGuardGuard', () => {
  let guard: MainAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({ });
    guard = TestBed.inject(MainAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
