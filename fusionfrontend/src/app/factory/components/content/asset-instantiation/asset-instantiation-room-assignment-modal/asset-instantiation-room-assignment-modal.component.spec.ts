import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetInstantiationRoomAssignmentModalComponent } from './asset-instantiation-room-assignment-modal.component';

describe('AssetInstantiationRoomAssignmentModalComponent', () => {
  let component: AssetInstantiationRoomAssignmentModalComponent;
  let fixture: ComponentFixture<AssetInstantiationRoomAssignmentModalComponent>;

  beforeEach(async(() => {
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
