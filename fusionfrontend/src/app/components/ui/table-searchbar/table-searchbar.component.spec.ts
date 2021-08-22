import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSearchbarComponent } from './table-searchbar.component';

describe('TableSearchbarComponent', () => {
  let component: TableSearchbarComponent;
  let fixture: ComponentFixture<TableSearchbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableSearchbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSearchbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
