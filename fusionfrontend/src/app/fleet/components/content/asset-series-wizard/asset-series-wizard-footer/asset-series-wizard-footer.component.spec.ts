import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSeriesWizardFooterComponent } from './asset-series-wizard-footer.component';

describe('AssetSeriesWizardFooterComponent', () => {
  let component: AssetSeriesWizardFooterComponent;
  let fixture: ComponentFixture<AssetSeriesWizardFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSeriesWizardFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesWizardFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
