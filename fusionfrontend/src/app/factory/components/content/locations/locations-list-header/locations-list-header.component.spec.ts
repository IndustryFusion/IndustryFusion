import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LocationsListHeaderComponent } from './locations-list-header.component';

describe('LocationsListHeaderComponent', () => {
  let component: LocationsListHeaderComponent;
  let fixture: ComponentFixture<LocationsListHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationsListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
