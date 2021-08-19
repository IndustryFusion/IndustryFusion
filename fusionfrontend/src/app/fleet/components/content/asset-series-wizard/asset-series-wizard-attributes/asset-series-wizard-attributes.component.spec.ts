import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetSeriesWizardAttributesComponent } from './asset-series-wizard-attributes.component';

describe('AssetSeriesWizardAttributesComponent', () => {
  let component: AssetSeriesWizardAttributesComponent;
  let fixture: ComponentFixture<AssetSeriesWizardAttributesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSeriesWizardAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesWizardAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
