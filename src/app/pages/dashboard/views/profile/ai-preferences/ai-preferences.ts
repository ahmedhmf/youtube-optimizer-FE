import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferencesService } from '../../../../../services/user-preferences.service';
import type { UserPreferences } from '../../../../../models/user-preferences.model';

const MESSAGE_CLEAR_DELAY = 5000;

@Component({
  selector: 'app-ai-preferences',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-preferences.html',
  styleUrl: './ai-preferences.scss',
})
export class AiPreferencesComponent implements OnInit {
  // Available options
  protected readonly availableLanguages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
  ];

  protected readonly availableTones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'informative', label: 'Informative' },
  ];

  protected readonly availableThumbnailStyles = [
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'bold', label: 'Bold & Colorful' },
    { value: 'professional', label: 'Professional' },
    { value: 'creative', label: 'Creative & Artistic' },
    { value: 'text-heavy', label: 'Text-Heavy' },
    { value: 'face-focused', label: 'Face-Focused' },
  ];

  protected readonly availableImageStyles = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'photographic', label: 'Photographic' },
    { value: 'digital-art', label: 'Digital Art' },
  ];

  protected readonly preferences = signal<UserPreferences | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditing = signal(false);

  // Form fields
  protected readonly language = signal('');
  protected readonly tone = signal('');
  protected readonly thumbnailStyle = signal('');
  protected readonly customInstructions = signal('');
  protected readonly imageStyle = signal('');

  private readonly preferencesService = inject(UserPreferencesService);

  public ngOnInit(): void {
    this.loadPreferences();
  }

  protected loadPreferences(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.preferencesService.getUserPreferences().subscribe({
      next: (response: UserPreferences | null) => {
        if (response) {
          this.preferences.set(response);
          this.language.set(response.language);
          this.tone.set(response.tone);
          this.thumbnailStyle.set(response.thumbnailStyle);
          this.customInstructions.set(response.customInstructions);
          this.imageStyle.set(response.imageStyle);
        } else {
          // No preferences exist yet, enable editing to create them
          this.isEditing.set(true);
        }
        this.isLoading.set(false);
      },
      error: () => {
        // If no preferences exist, user can create them
        this.errorMessage.set(null);
        this.isEditing.set(true);
        this.isLoading.set(false);
      },
    });
  }

  protected getLanguageLabel(value: string): string {
    return this.availableLanguages.find((l) => l.value === value)?.label ?? value;
  }

  protected getToneLabel(value: string): string {
    return this.availableTones.find((t) => t.value === value)?.label ?? value;
  }

  protected getThumbnailStyleLabel(value: string): string {
    return this.availableThumbnailStyles.find((s) => s.value === value)?.label ?? value;
  }

  protected getImageStyleLabel(value: string): string {
    return this.availableImageStyles.find((s) => s.value === value)?.label ?? value;
  }

  protected enableEditing(): void {
    this.isEditing.set(true);
  }

  protected cancelEditing(): void {
    const prefs = this.preferences();
    if (prefs) {
      // Restore original values
      this.language.set(prefs.language);
      this.tone.set(prefs.tone);
      this.thumbnailStyle.set(prefs.thumbnailStyle);
      this.customInstructions.set(prefs.customInstructions);
      this.imageStyle.set(prefs.imageStyle);
      this.isEditing.set(false);
    }
    this.errorMessage.set(null);
  }

  protected savePreferences(): void {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const preferencesData = {
      language: this.language(),
      tone: this.tone(),
      thumbnailStyle: this.thumbnailStyle(),
      customInstructions: this.customInstructions(),
      imageStyle: this.imageStyle(),
    };

    this.preferencesService.savePreferences(preferencesData).subscribe({
      next: (response) => {
        this.preferences.set(response.preferences);
        this.successMessage.set('AI preferences saved successfully!');
        this.isEditing.set(false);
        this.clearMessagesAfterDelay();
        this.isSaving.set(false);
      },
      error: (error: Error) => {
        this.handleError(error);
        this.isSaving.set(false);
      },
    });
  }

  private handleError(error: unknown): void {
    this.errorMessage.set(error instanceof Error ? error.message : 'Failed to save preferences');
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage.set(null);
      this.errorMessage.set(null);
    }, MESSAGE_CLEAR_DELAY);
  }
}
