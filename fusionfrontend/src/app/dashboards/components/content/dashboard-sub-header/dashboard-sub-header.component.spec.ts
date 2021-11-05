import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DashboardSubHeaderComponent } from './dashboard-sub-header.component';

describe('DashboardSubHeaderComponent', () => {
  let component: DashboardSubHeaderComponent;
  let fixture: ComponentFixture<DashboardSubHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSubHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
