import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSelectedItemsBarComponent } from './table-selected-items-bar.component';

describe('TableSelectedItemsBarComponent', () => {
  let component: TableSelectedItemsBarComponent;
  let fixture: ComponentFixture<TableSelectedItemsBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableSelectedItemsBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSelectedItemsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
