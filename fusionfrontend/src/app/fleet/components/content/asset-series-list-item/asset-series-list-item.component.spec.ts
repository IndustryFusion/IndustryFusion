import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetSeriesListItemComponent } from './asset-series-list-item.component';

describe('AssetSeriesListItemComponent', () => {
  let component: AssetSeriesListItemComponent;
  let fixture: ComponentFixture<AssetSeriesListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSeriesListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
