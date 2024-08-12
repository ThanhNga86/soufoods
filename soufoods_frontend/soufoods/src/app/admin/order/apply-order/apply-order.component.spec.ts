import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyOrderComponent } from './apply-order.component';

describe('ApplyOrderComponent', () => {
  let component: ApplyOrderComponent;
  let fixture: ComponentFixture<ApplyOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplyOrderComponent]
    });
    fixture = TestBed.createComponent(ApplyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
