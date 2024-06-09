import { TestBed } from '@angular/core/testing';

import { AdminReviewsService } from './admin-reviews.service';

describe('AdminReviewsService', () => {
  let service: AdminReviewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminReviewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
