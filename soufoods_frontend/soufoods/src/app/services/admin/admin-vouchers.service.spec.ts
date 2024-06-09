import { TestBed } from '@angular/core/testing';

import { AdminVouchersService } from './admin-vouchers.service';

describe('AdminVouchersService', () => {
  let service: AdminVouchersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminVouchersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
