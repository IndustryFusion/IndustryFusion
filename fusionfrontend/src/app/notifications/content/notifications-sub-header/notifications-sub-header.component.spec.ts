import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotificationsSubHeaderComponent } from './notifications-sub-header.component';

describe('NotificationsSubHeaderComponent', () => {
  let component: NotificationsSubHeaderComponent;
  let fixture: ComponentFixture<NotificationsSubHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsSubHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsSubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
