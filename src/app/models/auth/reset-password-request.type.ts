export type ResetPasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};
