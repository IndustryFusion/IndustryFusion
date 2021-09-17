import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotificationsListHeaderComponent } from './notifications-list-header.component';

describe('NotificationsListHeaderComponent', () => {
  let component: NotificationsListHeaderComponent;
  let fixture: ComponentFixture<NotificationsListHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
