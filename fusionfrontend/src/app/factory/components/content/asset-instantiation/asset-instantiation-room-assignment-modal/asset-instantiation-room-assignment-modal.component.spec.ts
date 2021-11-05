import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetInstantiationRoomAssignmentModalComponent } from './asset-instantiation-room-assignment-modal.component';

describe('AssetInstantiationRoomAssignmentModalComponent', () => {
  let component: AssetInstantiationRoomAssignmentModalComponent;
  let fixture: ComponentFixture<AssetInstantiationRoomAssignmentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetInstantiationRoomAssignmentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetInstantiationRoomAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
