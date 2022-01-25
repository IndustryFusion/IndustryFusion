import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftsFilterComponent } from './shifts-filter.component';

describe('TableGroupByComponent', () => {
  let component: ShiftsFilterComponent;
  let fixture: ComponentFixture<ShiftsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShiftsFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
