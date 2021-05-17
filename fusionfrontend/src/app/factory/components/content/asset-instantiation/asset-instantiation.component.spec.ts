import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetInstantiationComponent } from './asset-instantiation.component';

describe('AssetInstantiationComponent', () => {
  let component: AssetInstantiationComponent;
  let fixture: ComponentFixture<AssetInstantiationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetInstantiationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetInstantiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
