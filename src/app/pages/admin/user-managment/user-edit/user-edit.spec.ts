import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { UserEdit } from './user-edit';

describe('UserEdit', () => {
  let component: UserEdit;
  let fixture: ComponentFixture<UserEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEdit],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
