/* eslint-disable max-lines */
import { Component, inject, signal, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import type { AiSettings } from '../../../../models/ai-settings.model';
import { ApiService } from '../../../../services/api';
import type { AiMessageConfiguration } from '../../../../models/ai-message-configuration.model';
import { FormsModule } from '@angular/forms';
import type { AIConfigurationSettings } from '../../../../models/language.model';
import type { ApiError } from '../../../../models/api-error.model';
import type { Audits } from '../../../../models/audits.model';
import { JobQueueService, type JobEventData } from '../../../../services/job-queue.service';

type TabType = {
  id: 'url' | 'upload' | 'text';
  label: string;
  icon: string;
};

@Component({
  selector: 'app-analyze-url',
  imports: [FormsModule, NgClass],
  templateUrl: './analyze-url.html',
  styleUrl: './analyze-url.scss',
  standalone: true,
})
export class AnalyzeUrl implements OnDestroy {
  protected readonly activeTab = signal<TabType['id']>('url');
  protected readonly currentJobId = signal<string | null>(null);
  protected readonly jobProgress = signal<number>(0);
  protected readonly jobStage = signal<string>('');
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
  protected readonly error = signal<ApiError | null>(null);
  protected showSettings = signal(false);
  protected isDragging = false;
  protected readonly settings = signal<AiSettings>({
    language: 'english',
    tone: 'Professional & Authoritative',
    aiModel: 'midjourney',
  });
  private readonly api = inject(ApiService);
  private readonly jobQueue = inject(JobQueueService);
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
    this.activeTab.set(tabId);
    this.showSettings.set(false);
  }

  protected onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      throw new Error('No file selected');
    }
    if (!this.isValidFileType(file)) {
      throw new Error(
        `Invalid file type. Please select a video file (${this.VALID_VIDEO_TYPES.map((type) => type.split('/')[1].toUpperCase()).join(', ')})`,
      );
    }
    if (!this.isValidFileSize(file)) {
      throw new Error(
        `File size too large. Maximum allowed size is ${this.MAX_FILE_SIZE / (this.SIZE_1024 * this.SIZE_1024)}MB. Your file is ${(file.size / (this.SIZE_1024 * this.SIZE_1024)).toFixed(2)}MB`,
      );
    }
    if (file.size === 0) {
      throw new Error('The selected file appears to be empty or corrupted');
    }
    this.selectedFile.set(file);
  }

  protected removeFile(): void {
    this.selectedFile.set(null);
    this.resetFileInput();
  }

  protected analyzeVideo(): void {
    const currentTab = this.activeTab();
    if (currentTab === 'url') {
      this.analyzeFromUrl();
    } else if (currentTab === 'upload') {
      this.analyzeFromFile();
    } else {
      this.analyzeFromText();
    }
  }

  protected onLanguageChange(language: string): void {
    this.settings.set({ ...this.settings(), language });
  }

  protected onModelChange(model: string): void {
    this.settings.set({ ...this.settings(), aiModel: model });
  }

  protected onToneChange(tone: string): void {
    this.settings.set({ ...this.settings(), tone });
  }

  protected onTextAreaInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.textContent.set(textarea.value);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];

      if (!this.isValidFileType(file)) {
        throw new Error(
          `Invalid file type. Please select a video file (${this.VALID_VIDEO_TYPES.map((type) => type.split('/')[1].toUpperCase()).join(', ')})`,
        );
      }
      if (!this.isValidFileSize(file)) {
        throw new Error(
          `File size too large. Maximum allowed size is ${this.MAX_FILE_SIZE / (this.SIZE_1024 * this.SIZE_1024)}MB. Your file is ${(file.size / (this.SIZE_1024 * this.SIZE_1024)).toFixed(2)}MB`,
        );
      }
      if (file.size === 0) {
        throw new Error('The selected file appears to be empty or corrupted');
      }
      this.selectedFile.set(file);
    }
  }

  private analyzeFromUrl(): void {
    // Validation
    const url = this.videoUrl().trim();

    if (!url) {
      throw new Error('Please enter a YouTube URL');
    }

    if (!this.isValidYouTubeUrl(url)) {
      throw new Error(
        'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)',
      );
    }

    // Check if URL is accessible (basic format validation)
    if (!this.isUrlAccessible(url)) {
      throw new Error('The URL format appears to be invalid or incomplete');
    }

    this.showSettings.set(false);
    this.loading.set(true);
    this.jobProgress.set(0);
    this.jobStage.set('Initializing...');

    // Connect to WebSocket if not already connected
    this.jobQueue.connect();

    const urlConfig: AiMessageConfiguration = {
      url: url,
      language: this.settings().language,
      tone: this.settings().tone,
      model: this.settings().aiModel,
    };

    this.api.analyzeVideoUrl(urlConfig).subscribe({
      next: (res) => {
        // API returns jobId, not the result
        if (res && typeof res === 'object' && 'jobId' in res) {
          const jobId = (res as { jobId: string }).jobId;
          this.currentJobId.set(jobId);
          this.trackJobProgress(jobId);
        } else {
          // Fallback: old API response with immediate result
          this.result = res;
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.jobProgress.set(0);
        this.jobStage.set('');
        throw err;
      },
    });
  }

  private analyzeFromFile(): void {
    const file = this.selectedFile();

    if (!file) {
      throw new Error('No file selected for upload');
    }

    // Re-validate file before upload
    if (!this.isValidFileType(file) || !this.isValidFileSize(file)) {
      throw new Error(
        'Selected file type is not supported or the file size is too large. Please select a new file.',
      );
    }

    this.loading.set(true);
    this.showSettings.set(false);
    this.jobProgress.set(0);
    this.jobStage.set('Uploading file...');

    // Connect to WebSocket if not already connected
    this.jobQueue.connect();

    this.api.analyzeVideoUpload(file, this.settings()).subscribe({
      next: (res) => {
        // API returns jobId, not the result
        if (res && typeof res === 'object' && 'jobId' in res) {
          const jobId = (res as { jobId: string }).jobId;
          this.currentJobId.set(jobId);
          this.trackJobProgress(jobId);
        } else {
          // Fallback: old API response with immediate result
          this.result = res;
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.jobProgress.set(0);
        this.jobStage.set('');
        throw err;
      },
    });
  }

  private analyzeFromText(): void {
    const text = this.textContent().trim();

    if (!text) {
      throw new Error('Please enter some text to analyze');
    }

    if (text.length < this.MIN_TEXT_LENGTH) {
      throw new Error(
        `Text is too short. Please enter at least ${this.MIN_TEXT_LENGTH} characters. Current length: ${text.length}`,
      );
    }

    if (text.length > this.MAX_TEXT_LENGTH) {
      throw new Error(
        `Text is too long. Maximum allowed length is ${this.MAX_TEXT_LENGTH} characters. Current length: ${text.length}`,
      );
    }

    // Check for suspicious content or patterns
    if (this.containsSuspiciousContent(text)) {
      throw new Error('Text contains potentially harmful content or excessive special characters');
    }

    this.loading.set(true);
    this.showSettings.set(false);
    this.jobProgress.set(0);
    this.jobStage.set('Processing text...');

    // Connect to WebSocket if not already connected
    this.jobQueue.connect();

    this.api.analyzeText(text, this.settings()).subscribe({
      next: (res) => {
        // API returns jobId, not the result
        if (res && typeof res === 'object' && 'jobId' in res) {
          const jobId = (res as { jobId: string }).jobId;
          this.currentJobId.set(jobId);
          this.trackJobProgress(jobId);
        } else {
          // Fallback: old API response with immediate result
          this.result = res;
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.jobProgress.set(0);
        this.jobStage.set('');
        throw err;
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

  private resetFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.value = '';
  }

  private trackJobProgress(jobId: string): void {
    this.jobQueue.onJobEvent(jobId, (data: JobEventData) => {
      this.jobProgress.set(data.progress);
      
      if (data.stage) {
        this.jobStage.set(data.stage);
      }

      if (data.status === 'completed' && data.data) {
        this.result = data.data.data as unknown as Audits;
        this.loading.set(false);
        this.jobProgress.set(100);
        this.jobStage.set('Completed!');
        this.currentJobId.set(null);
      } else if (data.status === 'failed') {
        this.loading.set(false);
        this.jobProgress.set(0);
        this.jobStage.set('');
        this.currentJobId.set(null);
        const errorMessage = data.error ?? 'Analysis failed. Please try again.';
        throw new Error(errorMessage);
      } else if (data.status === 'cancelled') {
        this.loading.set(false);
        this.jobProgress.set(0);
        this.jobStage.set('');
        this.currentJobId.set(null);
      }
    });
  }

  public ngOnDestroy(): void {
    this.jobQueue.disconnect();
  }
}
