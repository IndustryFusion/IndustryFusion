import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetSeriesCreateStepTreeComponent } from './asset-series-create-step-tree.component';

describe('AssetSeriesCreateStepTreeComponent', () => {
  let component: AssetSeriesCreateStepTreeComponent;
  let fixture: ComponentFixture<AssetSeriesCreateStepTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSeriesCreateStepTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesCreateStepTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
