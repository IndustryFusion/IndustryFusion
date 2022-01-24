import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableGroupByComponent } from './table-group-by.component';

describe('TableGroupByComponent', () => {
  let component: TableGroupByComponent;
  let fixture: ComponentFixture<TableGroupByComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableGroupByComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableGroupByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
