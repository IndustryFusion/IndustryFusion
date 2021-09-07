import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotificationsListItemComponent } from './notifications-list-item.component';

describe('NotificationsListItemComponent', () => {
  let component: NotificationsListItemComponent;
  let fixture: ComponentFixture<NotificationsListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
