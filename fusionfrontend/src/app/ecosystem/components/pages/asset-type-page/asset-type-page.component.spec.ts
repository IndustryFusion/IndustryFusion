import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTypePageComponent } from './asset-type-page.component';

describe('AssetTypeDetailsPageComponent', () => {
  let component: AssetTypePageComponent;
  let fixture: ComponentFixture<AssetTypePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetTypePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetTypePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
