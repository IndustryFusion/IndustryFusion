import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSeriesCreateFooterComponent } from './asset-series-create-footer.component';

describe('AssetSeriesCreateFooterComponent', () => {
  let component: AssetSeriesCreateFooterComponent;
  let fixture: ComponentFixture<AssetSeriesCreateFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSeriesCreateFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriesCreateFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
