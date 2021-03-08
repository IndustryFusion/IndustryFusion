import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceListItemComponent } from './maintenance-list-item.component';

describe('MaintenanceListItemComponent', () => {
  let component: MaintenanceListItemComponent;
  let fixture: ComponentFixture<MaintenanceListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
