/* eslint-disable max-statements */
/* eslint-disable max-lines */
import { Component, inject, signal } from '@angular/core';
import type { AiSettings } from '../../../../models/ai-settings.model';
import { ApiService } from '../../../../services/api';
import type { AiMessageConfiguration } from '../../../../models/ai-message-configuration.model';
import { FormsModule } from '@angular/forms';
import type { AIConfigurationSettings } from '../../../../models/language.model';
import { HttpErrorResponse } from '@angular/common/http';
import type { ApiError } from '../../../../models/api-error.model';
import type { Audits } from '../../../../models/audits.model';
import {
  HTTP_400_ERROR_MESSAGES,
  HTTP_401_ERROR_MESSAGES,
  HTTP_403_ERROR_MESSAGES,
  HTTP_404_ERROR_MESSAGES,
  HTTP_413_ERROR_MESSAGES,
  HTTP_422_ERROR_MESSAGES,
  HTTP_429_ERROR_MESSAGES,
  HTTP_500_ERROR_MESSAGES,
  HTTP_502_ERROR_MESSAGES,
  HTTP_503_ERROR_MESSAGES,
  HTTP_504_ERROR_MESSAGES,
} from '../../../../constants/http-errors.constants';

type TabType = {
  id: 'url' | 'upload' | 'text';
  label: string;
  icon: string;
};

@Component({
  selector: 'app-analyze-url',
  imports: [FormsModule],
  templateUrl: './analyze-url.html',
  styleUrl: './analyze-url.scss',
})
export class AnalyzeUrl {
  protected readonly activeTab = signal<TabType['id']>('url');
  protected readonly tabs: TabType[] = [
    { id: 'url', label: 'YouTube URL', icon: 'link' },
    { id: 'upload', label: 'Upload Video', icon: 'upload_file' },
    { id: 'text', label: 'Text Analysis', icon: 'edit_note' },
  ];
  protected languages: AIConfigurationSettings[] = [
    { name: 'Arabic', value: 'arabic' },
    { name: 'English', value: 'english' },
    { name: 'Spanish', value: 'spanish' },
    { name: 'German', value: 'german' },
    { name: 'French', value: 'french' },
    { name: 'Italian', value: 'italian' },
    { name: 'Portuguese', value: 'portuguese' },
    { name: 'Dutch', value: 'dutch' },
  ];
  protected aiModels: AIConfigurationSettings[] = [
    { name: 'Midjourney', value: 'midjourney' },
    { name: 'DALL·E 2', value: 'dall-e-2' },
    { name: 'Stable Diffusion', value: 'stable-diffusion' },
    { name: 'GPT-4', value: 'gpt-4' },
  ];
  protected tones: AIConfigurationSettings[] = [
    { name: 'Professional & Authoritative', value: 'Professional & Authoritative' },
    { name: 'Friendly & Conversational', value: 'Friendly & Conversational' },
    { name: 'Playful & Humorous', value: 'Playful & Humorous' },
    { name: 'Formal & Serious', value: 'Formal & Serious' },
    { name: 'Caring & Empathetic', value: 'Caring & Empathetic' },
    { name: 'Inspiring & Visionary', value: 'Inspiring & Visionary' },
    { name: 'Minimal & Direct', value: 'Minimal & Direct' },
    { name: 'Educational & Helpful', value: 'Educational & Helpful' },
  ];
  protected readonly videoUrl = signal<string>('');
  protected readonly textContent = signal<string>('');
  protected readonly selectedFile = signal<File | null>(null);
  protected result: Audits | null = null;
  protected readonly loading = signal<boolean>(false);
  protected readonly showSettings = signal<boolean>(false);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly settings = signal<AiSettings>({
    language: 'english',
    tone: 'Professional & Authoritative',
    aiModel: 'midjourney',
  });
  private readonly api = inject(ApiService);
  private readonly SIZE_1024 = 1024;
  private readonly MAX_FILE_SIZE = 209715200; // 200MB
  private readonly VALID_VIDEO_TYPES = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/mkv',
    'video/webm',
    'video/quicktime',
  ];
  private readonly MIN_TEXT_LENGTH = 50;
  private readonly MAX_TEXT_LENGTH = 50000; // 50k characters limit
  private readonly PERCENTAGE_30_PERCENT = 0.3;

  protected get isAnalyzeDisabled(): boolean {
    if (this.loading() || this.error()) {
      return true;
    }

    const currentTab = this.activeTab();
    if (currentTab === 'url') {
      return !this.videoUrl().trim();
    } else if (currentTab === 'upload') {
      return !this.selectedFile();
    } else {
      return !this.textContent().trim() || this.textContent().length < this.MIN_TEXT_LENGTH;
    }
  }

  protected get analyzeButtonText(): string {
    if (this.loading()) {
      return 'Analyzing...';
    }

    const currentTab = this.activeTab();
    if (currentTab === 'url') {
      return 'Analyze Video';
    } else if (currentTab === 'upload') {
      return 'Upload & Analyze';
    } else {
      return 'Analyze Text';
    }
  }

  protected setActiveTab(tabId: TabType['id']): void {
    this.clearError();
    this.activeTab.set(tabId);
  }

  protected onFileSelected(event: Event): void {
    this.clearError();
    try {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        this.setError({
          message: 'No file selected',
        });
        return;
      }
      if (!this.isValidFileType(file)) {
        this.setError({
          message: `Invalid file type. Please select a video file (${this.VALID_VIDEO_TYPES.map((type) => type.split('/')[1].toUpperCase()).join(', ')})`,
          details: { selectedType: file.type, allowedTypes: this.VALID_VIDEO_TYPES },
        });
        this.resetFileInput();
        return;
      }
      if (!this.isValidFileSize(file)) {
        this.setError({
          message: `File size too large. Maximum allowed size is ${this.MAX_FILE_SIZE / (this.SIZE_1024 * this.SIZE_1024)}MB. Your file is ${(file.size / (this.SIZE_1024 * this.SIZE_1024)).toFixed(2)}MB`,
          details: { fileSize: file.size, maxSize: this.MAX_FILE_SIZE },
        });
        this.resetFileInput();
        return;
      }
      if (file.size === 0) {
        this.setError({
          message: 'The selected file appears to be empty or corrupted',
        });
        this.resetFileInput();
        return;
      }
      this.selectedFile.set(file);
    } catch (error) {
      this.setError({
        message: 'An unexpected error occurred while selecting the file',
        details: error,
      });
      this.resetFileInput();
    }
  }

  protected removeFile(): void {
    this.clearError();
    this.selectedFile.set(null);
    this.resetFileInput();
  }

  protected analyzeVideo(): void {
    this.clearError();

    const currentTab = this.activeTab();

    try {
      if (currentTab === 'url') {
        this.analyzeFromUrl();
      } else if (currentTab === 'upload') {
        this.analyzeFromFile();
      } else {
        this.analyzeFromText();
      }
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  protected onLanguageChange(language: string): void {
    this.clearError();
    this.settings.set({ ...this.settings(), language });
  }

  protected onModelChange(model: string): void {
    this.clearError();
    this.settings.set({ ...this.settings(), aiModel: model });
  }

  protected onToneChange(tone: string): void {
    this.clearError();
    this.settings.set({ ...this.settings(), tone });
  }

  protected onTextAreaInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.textContent.set(textarea.value);
    this.clearError();
  }

  private analyzeFromUrl(): void {
    // Validation
    const url = this.videoUrl().trim();

    if (!url) {
      this.setError({
        message: 'Please enter a YouTube URL',
      });
      return;
    }

    if (!this.isValidYouTubeUrl(url)) {
      this.setError({
        message:
          'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)',
        details: { url },
      });
      return;
    }

    // Check if URL is accessible (basic format validation)
    if (!this.isUrlAccessible(url)) {
      this.setError({
        message: 'The URL format appears to be invalid or incomplete',
        details: { url },
      });
      return;
    }

    this.showSettings.set(false);
    this.loading.set(true);

    const urlConfig: AiMessageConfiguration = {
      url: url,
      language: this.settings().language,
      tone: this.settings().tone,
      model: this.settings().aiModel,
    };

    this.api.analyzeVideoUrl(urlConfig).subscribe({
      next: (res) => {
        this.result = res;
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.handleApiError(err, 'URL analysis');
      },
    });
  }

  private analyzeFromFile(): void {
    const file = this.selectedFile();

    if (!file) {
      this.setError({
        message: 'Please select a video file',
      });
      return;
    }

    // Re-validate file before upload
    if (!this.isValidFileType(file) || !this.isValidFileSize(file)) {
      this.setError({
        message: 'Selected file is no longer valid. Please select a new file.',
      });
      return;
    }

    this.loading.set(true);
    this.showSettings.set(false);

    this.api.analyzeVideoUpload(file, this.settings()).subscribe({
      next: (res) => {
        this.result = res;
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.handleApiError(err, 'Video upload analysis');
      },
    });
  }

  private analyzeFromText(): void {
    const text = this.textContent().trim();

    if (!text) {
      this.setError({
        message: 'Please enter some text to analyze',
      });
      return;
    }

    if (text.length < this.MIN_TEXT_LENGTH) {
      this.setError({
        message: `Text is too short. Please enter at least ${this.MIN_TEXT_LENGTH} characters. Current length: ${text.length}`,
        details: { currentLength: text.length, minLength: this.MIN_TEXT_LENGTH },
      });
      return;
    }

    if (text.length > this.MAX_TEXT_LENGTH) {
      this.setError({
        message: `Text is too long. Maximum allowed length is ${this.MAX_TEXT_LENGTH} characters. Current length: ${text.length}`,
        details: { currentLength: text.length, maxLength: this.MAX_TEXT_LENGTH },
      });
      return;
    }

    // Check for suspicious content or patterns
    if (this.containsSuspiciousContent(text)) {
      this.setError({
        message: 'Text contains potentially harmful content or excessive special characters',
      });
      return;
    }

    this.loading.set(true);
    this.showSettings.set(false);

    this.api.analyzeText(text, this.settings()).subscribe({
      next: (res) => {
        this.result = res;
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.handleApiError(err, 'Text analysis');
      },
    });
  }

  private isValidYouTubeUrl(url: string): boolean {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
    return youtubeRegex.test(url);
  }

  private isUrlAccessible(url: string): boolean {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(urlObj.hostname);
    } catch {
      return false;
    }
  }

  private isValidFileType(file: File): boolean {
    return this.VALID_VIDEO_TYPES.includes(file.type);
  }

  private isValidFileSize(file: File): boolean {
    return file.size <= this.MAX_FILE_SIZE && file.size > 0;
  }

  private containsSuspiciousContent(text: string): boolean {
    // Check for excessive special characters
    const specialCharCount = (text.match(/[^a-zA-Z0-9\s.,!?;:'"()-]/g) ?? []).length;
    const specialCharRatio = specialCharCount / text.length;

    if (specialCharRatio > this.PERCENTAGE_30_PERCENT) {
      return true;
    } // More than 30% special characters

    // Check for repeated characters (potential spam)
    const repeatedCharsRegex = /(.)\1{10,}/;
    if (repeatedCharsRegex.test(text)) {
      return true;
    }

    return false;
  }

  // eslint-disable-next-line complexity
  private handleApiError(error: ApiError, operation: string): void {
    console.error(`${operation} failed:`, error);

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case HTTP_400_ERROR_MESSAGES:
          this.setError({
            message:
              error.error?.message ?? 'Invalid request. Please check your input and try again.',
            code: 'BAD_REQUEST',
            details: error.error,
          });
          break;

        case HTTP_401_ERROR_MESSAGES:
          this.setError({
            message: 'You are not authorized. Please log in and try again.',
            code: 'UNAUTHORIZED',
          });
          break;

        case HTTP_403_ERROR_MESSAGES:
          this.setError({
            message: 'Access forbidden. You may not have permission for this operation.',
            code: 'FORBIDDEN',
          });
          break;

        case HTTP_404_ERROR_MESSAGES:
          this.setError({
            message: 'Service not found. Please try again later.',
            code: 'NOT_FOUND',
          });
          break;

        case HTTP_413_ERROR_MESSAGES:
          this.setError({
            message: 'File or request too large. Please reduce the size and try again.',
            code: 'PAYLOAD_TOO_LARGE',
          });
          break;

        case HTTP_422_ERROR_MESSAGES:
          this.setError({
            message:
              error.error?.message ??
              'The content could not be processed. Please check your input.',
            code: 'UNPROCESSABLE_ENTITY',
            details: error.error,
          });
          break;

        case HTTP_429_ERROR_MESSAGES:
          this.setError({
            message: 'Too many requests. Please wait a moment and try again.',
            code: 'RATE_LIMIT',
          });
          break;

        case HTTP_500_ERROR_MESSAGES:
          this.setError({
            message: 'Server error occurred. Please try again later.',
            code: 'INTERNAL_SERVER_ERROR',
          });
          break;

        case HTTP_502_ERROR_MESSAGES:
        case HTTP_503_ERROR_MESSAGES:
        case HTTP_504_ERROR_MESSAGES:
          this.setError({
            message: 'Service is temporarily unavailable. Please try again in a few minutes.',
            code: 'SERVICE_UNAVAILABLE',
          });
          break;

        default:
          this.setError({
            message: `An unexpected error occurred (${error.status}). Please try again.`,
            code: `HTTP_${error.status}`,
            details: error.error,
          });
      }
    } else if (error.message.includes('TimeoutError')) {
      this.setError({
        message: 'Request timed out. Please check your connection and try again.',
        code: 'TIMEOUT',
      });
    } else if (error.message.includes('NetworkError')) {
      this.setError({
        message: 'Network connection error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      });
    } else {
      this.handleUnexpectedError(error);
    }
  }

  private handleUnexpectedError(error: unknown): void {
    console.error('Unexpected error:', error);
    this.setError({
      message: 'An unexpected error occurred. Please refresh the page and try again.',
      details: error,
    });
  }

  private setError(error: ApiError): void {
    this.error.set(error);
    this.loading.set(false);
  }

  private clearError(): void {
    this.error.set(null);
  }

  private resetFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.value = '';
  }
}
