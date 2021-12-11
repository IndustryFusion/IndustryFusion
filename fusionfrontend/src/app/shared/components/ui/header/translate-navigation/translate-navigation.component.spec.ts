import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateNavigationComponent } from './translate-navigation.component';

describe('TranslateNavigationComponent', () => {
  let component: TranslateNavigationComponent;
  let fixture: ComponentFixture<TranslateNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranslateNavigationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TranslateNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
