import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailStyle } from './thumbnail-style';

describe('ThumbnailStyle', () => {
  let component: ThumbnailStyle;
  let fixture: ComponentFixture<ThumbnailStyle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbnailStyle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThumbnailStyle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
