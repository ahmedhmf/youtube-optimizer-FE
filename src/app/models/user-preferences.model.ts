export type UserPreferences = {
  id?: string;
  userId: string;
  language: string;
  tone: string;
  thumbnailStyle: string;
  customInstructions: string;
  imageStyle: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateUserPreferencesRequest = {
  language: string;
  tone: string;
  thumbnailStyle: string;
  customInstructions: string;
  imageStyle: string;
};

export type UpdateUserPreferencesRequest = {
  language?: string;
  tone?: string;
  thumbnailStyle?: string;
  customInstructions?: string;
  imageStyle?: string;
};

export type UserPreferencesResponse = {
  success: boolean;
  preferences: UserPreferences;
};
