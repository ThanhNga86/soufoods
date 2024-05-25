import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAccountComponent } from './menu-account.component';

describe('MenuAccountComponent', () => {
  let component: MenuAccountComponent;
  let fixture: ComponentFixture<MenuAccountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuAccountComponent]
    });
    fixture = TestBed.createComponent(MenuAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
