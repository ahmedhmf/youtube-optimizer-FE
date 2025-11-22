import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardValueCard } from './dashboard-value-card';

describe('DashboardValueCard', () => {
  let component: DashboardValueCard;
  let fixture: ComponentFixture<DashboardValueCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardValueCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardValueCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
