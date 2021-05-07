import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetSeriesListComponent } from './asset-series-list.component';

describe('AssetSeriesListComponent', () => {
  let component: AssetSeriesListComponent;
  let fixture: ComponentFixture<AssetSeriesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSeriesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
