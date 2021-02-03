import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsListItemComponent } from './locations-list-item.component';

describe('LocationsListItemComponent', () => {
  let component: LocationsListItemComponent;
  let fixture: ComponentFixture<LocationsListItemComponent>;

  beforeEach(async(() => {
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
