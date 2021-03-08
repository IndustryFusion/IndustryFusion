import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceListHeaderComponent } from './maintenance-list-header.component';

describe('MaintenanceListHeaderComponent', () => {
  let component: MaintenanceListHeaderComponent;
  let fixture: ComponentFixture<MaintenanceListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
