import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceProgressbarComponent } from './maintenance-progressbar.component';

describe('MaintenanceProgressbarComponent', () => {
  let component: MaintenanceProgressbarComponent;
  let fixture: ComponentFixture<MaintenanceProgressbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceProgressbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
