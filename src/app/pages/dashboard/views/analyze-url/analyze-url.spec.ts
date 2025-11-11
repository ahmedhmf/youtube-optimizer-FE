import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzeUrl } from './analyze-url';

describe('AnalyzeUrl', () => {
  let component: AnalyzeUrl;
  let fixture: ComponentFixture<AnalyzeUrl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzeUrl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyzeUrl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
