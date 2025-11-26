import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ResetPasswordModal } from './reset-password-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ResetPasswordModal', () => {
  let component: ResetPasswordModal;
  let fixture: ComponentFixture<ResetPasswordModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordModal, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeModal when onClose is called', () => {
    jest.spyOn(component.closeModal, 'emit');
    component['onClose']();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    const initialState = component['showCurrentPassword']();
    component['toggleCurrentPasswordVisibility']();
    expect(component['showCurrentPassword']()).toBe(!initialState);
  });

  it('should show error when fields are empty', () => {
    component['onSubmit']();
    expect(component['errorMessage']()).toBe('All fields are required');
  });

  it('should show error when password is too short', () => {
    component['currentPassword'].set('oldpass123');
    component['newPassword'].set('short');
    component['confirmPassword'].set('short');
    component['onSubmit']();
    expect(component['errorMessage']()).toBe('New password must be at least 8 characters long');
  });

  it('should show error when passwords do not match', () => {
    component['currentPassword'].set('oldpass123');
    component['newPassword'].set('newpass123');
    component['confirmPassword'].set('different123');
    component['onSubmit']();
    expect(component['errorMessage']()).toBe('New passwords do not match');
  });

  it('should show error when new password is same as current', () => {
    component['currentPassword'].set('samepass123');
    component['newPassword'].set('samepass123');
    component['confirmPassword'].set('samepass123');
    component['onSubmit']();
    expect(component['errorMessage']()).toBe(
      'New password must be different from current password',
    );
  });
});
