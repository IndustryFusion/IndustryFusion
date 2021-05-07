import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTypeEditComponent } from './asset-type-edit.component';

describe('AssetTypeEditComponent', () => {
  let component: AssetTypeEditComponent;
  let fixture: ComponentFixture<AssetTypeEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetTypeEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetTypeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
