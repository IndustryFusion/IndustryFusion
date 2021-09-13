import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EquipmentEfficiencyPageComponent } from './equipment-efficiency-page.component';

describe('EquipmentEfficiencyPageComponent', () => {
  let component: EquipmentEfficiencyPageComponent;
  let fixture: ComponentFixture<EquipmentEfficiencyPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentEfficiencyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentEfficiencyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
