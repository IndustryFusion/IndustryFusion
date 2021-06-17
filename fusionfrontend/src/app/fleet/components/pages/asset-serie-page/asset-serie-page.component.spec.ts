import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSeriePageComponent } from './asset-serie-page.component';

describe('AssetSeriePageComponent', () => {
  let component: AssetSeriePageComponent;
  let fixture: ComponentFixture<AssetSeriePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSeriePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSeriePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
