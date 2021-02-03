import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetInstantiationStartModalComponent } from './asset-instantiation-start-modal.component';

describe('AssetInstantiationStartModalComponent', () => {
  let component: AssetInstantiationStartModalComponent;
  let fixture: ComponentFixture<AssetInstantiationStartModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetInstantiationStartModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetInstantiationStartModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
