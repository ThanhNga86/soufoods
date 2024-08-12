import { TestBed } from '@angular/core/testing';

import { AdminStaticsService } from './admin-statics.service';

describe('AdminStaticsService', () => {
  let service: AdminStaticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminStaticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
