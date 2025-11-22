import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { UserManagment } from './user-managment';

describe('UserManagment', () => {
  let component: UserManagment;
  let fixture: ComponentFixture<UserManagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagment],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
