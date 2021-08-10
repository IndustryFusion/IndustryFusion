import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetSeriesCreateAttributesComponent } from './asset-series-create-attributes.component';

describe('AssetSeriesCreateStepFourComponent', () => {
  let component: AssetSeriesCreateAttributesComponent;
  let fixture: ComponentFixture<AssetSeriesCreateAttributesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSeriesCreateAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesCreateAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
