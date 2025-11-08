import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../services/auth';
import { MatIcon } from '@angular/material/icon';
import { JsonPipe } from '@angular/common';
import { ApiService } from '../../../services/api';
import { VideoAuditsStore } from '../../../stores/video-audits.store';
import { MatDividerModule } from '@angular/material/divider';
import { AiMessageConfiguration } from '../../../models/ai-message-configuration.model';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface AiModel {
  id: string;
  name: string;
  description: string;
}

interface Tone {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.html',
  styleUrls: ['./analyze.scss'],
  imports: [
    FormsModule,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIcon,
    JsonPipe,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatTabsModule,
    MatCheckboxModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyzeComponent {
  protected store = inject(VideoAuditsStore);
  private supabase = inject(AuthService);
  private api = inject(ApiService);

  // Sample URLs for different platforms
  private readonly sampleUrls = {
    youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    vimeo: 'https://vimeo.com/148751763',
    dailymotion: 'https://www.dailymotion.com/video/x2hwqn9'
  };

  // Sample transcripts
  private readonly sampleTranscripts = {
    tech: `Welcome to today's tutorial on Angular Signals. In this video, we'll explore how signals work in Angular 17 and beyond.

Signals are a new reactive primitive that allows you to track state changes in your application. Unlike traditional observables, signals provide a simpler API for managing reactive state.

First, let's create a basic signal:
const count = signal(0);

To read the signal value, we call it as a function:
console.log(count()); // outputs: 0

To update the signal, we use the set method:
count.set(5);

Or we can use update for more complex transformations:
count.update(value => value + 1);

The key benefit of signals is that they automatically track dependencies and update the UI when values change. This makes your application more performant and easier to debug.

That's it for today's tutorial! Thanks for watching and don't forget to subscribe for more Angular content.`,

    presentation: `Good morning everyone, and thank you for joining us today. I'm excited to present our Q4 results and outline our strategy for the upcoming year.

First, let's review our performance metrics. We achieved a 23% increase in revenue compared to last quarter, exceeding our initial projections by 8%. Our customer satisfaction scores have improved to 4.7 out of 5, reflecting the quality improvements we've implemented.

Our key initiatives for this quarter included:
- Expanding our product line with three new offerings
- Improving our customer support response time by 40%
- Implementing new automation tools that reduced operational costs by 15%

Looking ahead to next year, we have three main strategic priorities:

First, market expansion. We're planning to enter two new geographical markets, with initial investment of 2.3 million dollars.

Second, technology modernization. We'll be upgrading our core systems to improve efficiency and customer experience.

Third, talent acquisition. We're planning to grow our team by 30%, focusing on engineering and customer success roles.

I'm confident that with these initiatives, we'll continue our growth trajectory and deliver exceptional value to our stakeholders.

Thank you for your attention, and I'll now take questions.`,

    interview: `Host: Welcome to Tech Talks podcast. I'm here today with Sarah Chen, the CTO of InnovateTech. Sarah, thanks for joining us.

Sarah: Thanks for having me, it's great to be here.

Host: Let's start with your background. You've had quite a journey from software engineer to CTO. Can you tell us about that path?

Sarah: Absolutely. I started as a junior developer about 12 years ago, working on web applications. What really shaped my career was my curiosity about how technology could solve real business problems, not just technical challenges.

Host: That's interesting. What would you say was the turning point in your career?

Sarah: I think it was when I led my first major project - a complete system overhaul for a client. It taught me that technical skills are just one part of the equation. Communication, project management, and understanding user needs are equally important.

Host: Speaking of communication, how do you manage technical teams while also interfacing with business stakeholders?

Sarah: It's all about translation. I see my role as a bridge between the technical and business worlds. When talking to developers, I focus on architecture, performance, and code quality. With business stakeholders, I translate that into impact, timelines, and ROI.

Host: What advice would you give to aspiring CTOs?

Sarah: Don't just focus on the latest technologies. Understand the business, develop your soft skills, and always keep learning. The role of a CTO is as much about people and strategy as it is about technology.

Host: Sarah, thank you so much for sharing your insights with us today.

Sarah: My pleasure, thanks for having me.`
  };

  // Configuration options
  readonly languages: Language[] = [
    { code: 'en', name: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
    { code: 'es', name: 'Spanish', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
    { code: 'fr', name: 'French', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
    { code: 'de', name: 'German', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
    { code: 'it', name: 'Italian', flag: '\uD83C\uDDEE\uD83C\uDDF9' },
    { code: 'pt', name: 'Portuguese', flag: '\uD83C\uDDF5\uD83C\uDDF9' },
    { code: 'ru', name: 'Russian', flag: '\uD83C\uDDF7\uD83C\uDDFA' },
    { code: 'ja', name: 'Japanese', flag: '\uD83C\uDDEF\uD83C\uDDF5' },
    { code: 'ko', name: 'Korean', flag: '\uD83C\uDDF0\uD83C\uDDF7' },
    { code: 'zh', name: 'Chinese', flag: '\uD83C\uDDE8\uD83C\uDDF3' },
    { code: 'ar', name: 'Arabic', flag: '\uD83C\uDDF8\uD83C\uDDE6' }
  ];

  readonly aiModels: AiModel[] = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most advanced model with superior reasoning' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
    { id: 'claude-3', name: 'Claude 3', description: 'Excellent for detailed analysis' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s advanced multimodal AI' },
    { id: 'llama-2', name: 'Llama 2', description: 'Open-source model with good performance' }
  ];

  readonly tones: Tone[] = [
    { id: 'professional', name: 'Professional', description: 'Formal and business-like', icon: 'business', color: '#1976d2' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and conversational', icon: 'chat', color: '#388e3c' },
    { id: 'friendly', name: 'Friendly', description: 'Warm and approachable', icon: 'sentiment_satisfied', color: '#f57c00' },
    { id: 'technical', name: 'Technical', description: 'Detailed and precise', icon: 'engineering', color: '#7b1fa2' },
    { id: 'creative', name: 'Creative', description: 'Imaginative and inspiring', icon: 'palette', color: '#e91e63' },
    { id: 'analytical', name: 'Analytical', description: 'Data-driven and objective', icon: 'analytics', color: '#00796b' }
  ];

  // Signals for content
  readonly sourceUrl = signal<string>('');
  readonly title = signal<string>('');
  readonly selectedFile = signal<File | null>(null);
  readonly transcript = signal<string>('');
  
  // UI state signals
  readonly selectedTabIndex = signal<number>(0);
  readonly urlMenuOpen = signal<boolean>(false);
  readonly fileConfigMenuOpen = signal<boolean>(false);
  readonly transcriptConfigMenuOpen = signal<boolean>(false);
  readonly isDragOver = signal<boolean>(false);
  
  // Configuration signals
  readonly selectedLanguage = signal<string>('en');
  readonly selectedAiModel = signal<string>('gpt-4');
  readonly selectedTone = signal<string>('professional');
  
  // Transcript-specific options
  readonly cleanTranscript = signal<boolean>(true);
  readonly includeSentimentAnalysis = signal<boolean>(true);
  readonly extractKeywords = signal<boolean>(true);

  // Validation method
  canAnalyze(): boolean {
    switch (this.selectedTabIndex()) {
      case 0: return !!this.sourceUrl().trim(); // URL tab
      case 1: return !!this.selectedFile(); // File tab
      case 2: return !!this.transcript().trim(); // Transcript tab
      default: return false;
    }
  }

  // Tab management
  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    this.urlMenuOpen.set(false);
    this.fileConfigMenuOpen.set(false);
    this.transcriptConfigMenuOpen.set(false);
  }

  // Menu toggles
  toggleUrlMenu(): void {
    this.urlMenuOpen.set(!this.urlMenuOpen());
  }

  toggleFileConfigMenu(): void {
    this.fileConfigMenuOpen.set(!this.fileConfigMenuOpen());
  }

  toggleTranscriptConfigMenu(): void {
    this.transcriptConfigMenuOpen.set(!this.transcriptConfigMenuOpen());
  }

  // File upload methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  private handleFileSelection(file: File): void {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      this.store.setMessage('Please select a valid video file (MP4, AVI, MOV, MKV, WebM)');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      this.store.setMessage('File size must be less than 100MB');
      return;
    }

    this.selectedFile.set(file);
    this.store.setMessage(''); // Clear any previous error messages
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toUpperCase();
    return extension || 'Unknown';
  }

  // URL methods
  selectSampleUrl(platform: 'youtube' | 'vimeo' | 'dailymotion'): void {
    this.sourceUrl.set(this.sampleUrls[platform]);
    this.urlMenuOpen.set(false);
  }

  clearUrl(): void {
    this.sourceUrl.set('');
    this.urlMenuOpen.set(false);
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.sourceUrl.set(text);
      this.urlMenuOpen.set(false);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      this.store.setMessage('Failed to access clipboard. Please paste manually.');
    }
  }

  // Transcript methods
  async pasteTranscriptFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.transcript.set(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      this.store.setMessage('Failed to paste from clipboard. Please paste manually.');
    }
  }

  clearTranscript(): void {
    this.transcript.set('');
  }

  loadSampleTranscript(type: 'tech' | 'presentation' | 'interview'): void {
    this.transcript.set(this.sampleTranscripts[type]);
  }

  getCharacterCount(): number {
    return this.transcript().length;
  }

  getWordCount(): number {
    const text = this.transcript().trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }

  // Configuration methods
  setLanguage(language: string): void {
    this.selectedLanguage.set(language);
  }

  setAiModel(model: string): void {
    this.selectedAiModel.set(model);
  }

  setTone(tone: string): void {
    this.selectedTone.set(tone);
  }

  resetToDefaults(): void {
    this.selectedLanguage.set('en');
    this.selectedAiModel.set('gpt-4');
    this.selectedTone.set('professional');
    this.cleanTranscript.set(true);
    this.includeSentimentAnalysis.set(true);
    this.extractKeywords.set(true);
  }

  // Main analysis method
  async analyze(): Promise<void> {
    try {
      if (!this.canAnalyze()) { return; }

      // Close all menus
      this.urlMenuOpen.set(false);
      this.fileConfigMenuOpen.set(false);
      this.transcriptConfigMenuOpen.set(false);
      this.store.setMessage('');
      
      // Prepare base configuration
      const baseConfig = {
        language: this.selectedLanguage(),
        model: this.selectedAiModel(),
        tone: this.selectedTone(),
        title: this.title().trim()
      };

      // Add user ID if authenticated
      const user = await this.supabase.getUser();
      const userId = user?.id || '';

      switch (this.selectedTabIndex()) {
        case 0: // URL analysis
          const urlConfig: AiMessageConfiguration = {
            ...baseConfig,
            url: this.sourceUrl().trim(),
            userId
          };
          this.api.analyzeVideo(urlConfig);
          break;

        case 1: // File analysis
          const fileConfig = {
            ...baseConfig,
            userId
          };
          this.api.analyzeVideoFile(this.selectedFile()!, fileConfig);
          break;

        case 2: // Transcript analysis
          const transcriptConfig = {
            ...baseConfig,
            userId,
            cleanTranscript: this.cleanTranscript(),
            includeSentimentAnalysis: this.includeSentimentAnalysis(),
            extractKeywords: this.extractKeywords()
          };
          // You'll need to implement this method in your API service
          this.api.analyzeTranscript(this.transcript().trim(), transcriptConfig);
          break;
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      this.store.setMessage(err?.message || 'Analysis failed. Please try again.');
    }
  }

  // Reset method
  reset(): void {
    // Content
    this.sourceUrl.set('');
    this.selectedFile.set(null);
    this.transcript.set('');
    this.title.set('');
    
    // UI state
    this.urlMenuOpen.set(false);
    this.fileConfigMenuOpen.set(false);
    this.transcriptConfigMenuOpen.set(false);
    this.isDragOver.set(false);
    
    // Reset transcript-specific options
    this.cleanTranscript.set(true);
    this.includeSentimentAnalysis.set(true);
    this.extractKeywords.set(true);
    
    // Store state
    this.store.setStatus('idle');
    this.store.setMessage('');
  }
}