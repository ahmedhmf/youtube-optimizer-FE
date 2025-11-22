import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreTab } from './core-tab';

describe('CoreTab', () => {
  let component: CoreTab;
  let fixture: ComponentFixture<CoreTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
