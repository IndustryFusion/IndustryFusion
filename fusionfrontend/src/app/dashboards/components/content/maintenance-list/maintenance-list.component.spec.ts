import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MaintenanceListComponent } from './maintenance-list.component';

describe('MaintenanceListComponent', () => {
  let component: MaintenanceListComponent;
  let fixture: ComponentFixture<MaintenanceListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
