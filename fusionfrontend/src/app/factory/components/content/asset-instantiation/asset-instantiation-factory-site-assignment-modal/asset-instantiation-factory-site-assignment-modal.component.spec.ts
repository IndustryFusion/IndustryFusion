import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AssetInstantiationFactorySiteAssignmentModalComponent } from './asset-instantiation-factory-site-assignment-modal.component';

describe('AssetInstantiationFactorySiteAssignmentModalComponent', () => {
  let component: AssetInstantiationFactorySiteAssignmentModalComponent;
  let fixture: ComponentFixture<AssetInstantiationFactorySiteAssignmentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetInstantiationFactorySiteAssignmentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetInstantiationFactorySiteAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
