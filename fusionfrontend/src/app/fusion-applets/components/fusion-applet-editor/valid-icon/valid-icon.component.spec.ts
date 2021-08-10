import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidIconComponent } from './valid-icon.component';

describe('ValidIconComponent', () => {
  let component: ValidIconComponent;
  let fixture: ComponentFixture<ValidIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
