import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoAnalysis } from './video-analysis';

describe('VideoAnalysis', () => {
  let component: VideoAnalysis;
  let fixture: ComponentFixture<VideoAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoAnalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoAnalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
