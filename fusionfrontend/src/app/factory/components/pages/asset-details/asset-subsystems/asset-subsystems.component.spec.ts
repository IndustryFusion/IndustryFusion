import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSubsystemsComponent } from './asset-subsystems.component';

describe('AssetSubsystemsComponent', () => {
  let component: AssetSubsystemsComponent;
  let fixture: ComponentFixture<AssetSubsystemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSubsystemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSubsystemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
