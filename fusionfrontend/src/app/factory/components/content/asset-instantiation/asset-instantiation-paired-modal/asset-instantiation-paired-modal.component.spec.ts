import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetInstantiationPairedModalComponent } from './asset-instantiation-paired-modal.component';

describe('AssetInstantiationPairedModalComponent', () => {
  let component: AssetInstantiationPairedModalComponent;
  let fixture: ComponentFixture<AssetInstantiationPairedModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetInstantiationPairedModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetInstantiationPairedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
