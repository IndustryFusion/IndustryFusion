import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactorySitesListHeaderComponent } from './factory-sites-list-header.component';

describe('FactorySitesListHeaderComponent', () => {
  let component: FactorySitesListHeaderComponent;
  let fixture: ComponentFixture<FactorySitesListHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FactorySitesListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactorySitesListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
