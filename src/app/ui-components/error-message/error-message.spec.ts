import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ErrorMessage } from './error-message';

describe('ErrorMessage', () => {
  let component: ErrorMessage;
  let fixture: ComponentFixture<ErrorMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
