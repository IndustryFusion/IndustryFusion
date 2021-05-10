import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetsListHeaderComponent } from './assets-list-header.component';

describe('AssetsListHeaderComponent', () => {
  let component: AssetsListHeaderComponent;
  let fixture: ComponentFixture<AssetsListHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
