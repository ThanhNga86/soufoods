import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickAddressComponent } from './pick-address.component';

describe('PickAddressComponent', () => {
  let component: PickAddressComponent;
  let fixture: ComponentFixture<PickAddressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PickAddressComponent]
    });
    fixture = TestBed.createComponent(PickAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
