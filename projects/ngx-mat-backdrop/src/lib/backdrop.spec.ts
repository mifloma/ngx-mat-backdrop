import { TestBed } from '@angular/core/testing';

import { Backdrop } from './backdrop';

describe('Backdrop', () => {
  let service: Backdrop;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Backdrop);
  });

  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });
});
