import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LocationsListItemComponent } from './locations-list-item.component';

describe('LocationsListItemComponent', () => {
  let component: LocationsListItemComponent;
  let fixture: ComponentFixture<LocationsListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationsListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
