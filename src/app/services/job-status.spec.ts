import { TestBed } from '@angular/core/testing';

import { JobStatus } from './job-status';

describe('JobStatus', () => {
  let service: JobStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
