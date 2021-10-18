import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSeriesInstancePageComponent } from './asset-series-instance-page.component';

describe('AssetSeriePageComponent', () => {
  let component: AssetSeriesInstancePageComponent;
  let fixture: ComponentFixture<AssetSeriesInstancePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSeriesInstancePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesInstancePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
