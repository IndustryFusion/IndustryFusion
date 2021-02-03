import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSeriesCreateStepFourComponent } from './asset-series-create-step-four.component';

describe('AssetSeriesCreateStepFourComponent', () => {
  let component: AssetSeriesCreateStepFourComponent;
  let fixture: ComponentFixture<AssetSeriesCreateStepFourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSeriesCreateStepFourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesCreateStepFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
