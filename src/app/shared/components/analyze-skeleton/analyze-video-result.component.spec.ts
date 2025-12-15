import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzeVideoResultComponent } from './analyze-video-result.component';

describe('AnalyzeSkeleton', () => {
  let component: AnalyzeVideoResultComponent;
  let fixture: ComponentFixture<AnalyzeVideoResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzeVideoResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyzeVideoResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
