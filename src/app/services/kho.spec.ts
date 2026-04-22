import { TestBed } from '@angular/core/testing';

import { Kho } from './kho';

describe('Kho', () => {
  let service: Kho;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Kho);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
