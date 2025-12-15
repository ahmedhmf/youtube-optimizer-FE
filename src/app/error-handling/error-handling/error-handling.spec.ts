import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ErrorHandling } from './error-handling';

describe('ErrorHandling', () => {
  let component: ErrorHandling;
  let fixture: ComponentFixture<ErrorHandling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorHandling],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorHandling);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
