import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FusionAppletsComponent } from './fusion-applets.component';

describe('FusionAppletsComponent', () => {
  let component: FusionAppletsComponent;
  let fixture: ComponentFixture<FusionAppletsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FusionAppletsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FusionAppletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
