import { TestBed, inject } from '@angular/core/testing';

import { DiagramService } from './diagram.service';

describe('DiagramService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiagramService]
    });
  });

  it('should be created', inject([DiagramService], (service: DiagramService) => {
    expect(service).toBeTruthy();
  }));
});
