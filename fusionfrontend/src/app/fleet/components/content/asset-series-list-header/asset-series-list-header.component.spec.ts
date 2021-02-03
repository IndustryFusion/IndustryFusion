import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSeriesListHeaderComponent } from './asset-series-list-header.component';

describe('AssetSeriesListHeaderComponent', () => {
  let component: AssetSeriesListHeaderComponent;
  let fixture: ComponentFixture<AssetSeriesListHeaderComponent>;

  beforeEach(async(() => {
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
