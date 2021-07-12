import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactorySitesListItemComponent } from './factory-sites-list-item.component';

describe('FactorySitesListItemComponent', () => {
  let component: FactorySitesListItemComponent;
  let fixture: ComponentFixture<FactorySitesListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FactorySitesListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactorySitesListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
