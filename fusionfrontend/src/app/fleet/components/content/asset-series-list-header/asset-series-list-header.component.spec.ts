import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetSeriesListHeaderComponent } from './asset-series-list-header.component';

describe('AssetSeriesListHeaderComponent', () => {
  let component: AssetSeriesListHeaderComponent;
  let fixture: ComponentFixture<AssetSeriesListHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSeriesListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
