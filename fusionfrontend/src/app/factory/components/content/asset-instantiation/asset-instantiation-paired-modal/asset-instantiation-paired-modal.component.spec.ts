import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetInstantiationPairedModalComponent } from './asset-instantiation-paired-modal.component';

describe('AssetInstantiationPairedModalComponent', () => {
  let component: AssetInstantiationPairedModalComponent;
  let fixture: ComponentFixture<AssetInstantiationPairedModalComponent>;

  beforeEach(async(() => {
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
