import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSeriesOverviewPageComponent } from './asset-series-overview-page.component';

describe('AssetSeriesOverviewPageComponent', () => {
  let component: AssetSeriesOverviewPageComponent;
  let fixture: ComponentFixture<AssetSeriesOverviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSeriesOverviewPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
