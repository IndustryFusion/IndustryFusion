import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSaveButtonComponent } from './modal-save-button.component';

describe('ModalSaveButtonComponent', () => {
  let component: ModalSaveButtonComponent;
  let fixture: ComponentFixture<ModalSaveButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSaveButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSaveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
