import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsListHeaderComponent } from './locations-list-header.component';

describe('LocationsListHeaderComponent', () => {
  let component: LocationsListHeaderComponent;
  let fixture: ComponentFixture<LocationsListHeaderComponent>;

  beforeEach(async(() => {
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
