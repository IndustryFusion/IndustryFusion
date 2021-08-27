import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDigitalNameplateComponent } from './asset-digital-nameplate.component';

describe('AssetDigitalNameplateComponent', () => {
  let component: AssetDigitalNameplateComponent;
  let fixture: ComponentFixture<AssetDigitalNameplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetDigitalNameplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetDigitalNameplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
