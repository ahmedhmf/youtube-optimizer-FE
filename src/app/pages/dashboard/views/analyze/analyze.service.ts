import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import type {
  VideoData,
  GeneratedContent,
  GeneratedThumbnail,
} from '../../../../stores/dashboard/analyze.store';
import { analyzeStore } from '../../../../stores/dashboard/analyze.store';

@Injectable({
  providedIn: 'root',
})
export class AnalyzeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.backendURL;
  private readonly analyzeStore = inject(analyzeStore);

  public getAnalysisResults(videoUrl: string): void {
    this.http
      .post<VideoData>(
        `${this.baseUrl}/api/v1/workflow/analyze`,
        { videoUrl },
        { withCredentials: true },
      )
      .pipe(
        tap((results) => {
          this.analyzeStore.setAnalysisResults(results);
        }),
      )
      .subscribe();
  }

  public generateContent(
    videoUrl: string,
    fields: Array<'title' | 'description' | 'tags' | 'keywords' | 'thumbnail'>,
  ): void {
    this.http
      .post<GeneratedContent>(
        `${this.baseUrl}/api/v1/workflow/generate-content`,
        { videoUrl, fields },
        { withCredentials: true },
      )
      .pipe(
        tap((content) => {
          this.analyzeStore.setGeneratedContent(content);
        }),
      )
      .subscribe();
  }

  public generateThumbnail(data: {
    videoUrl: string;
    template: string;
    templateData: Record<string, unknown>;
    brandLogo?: {
      url: string;
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      size: 'small' | 'medium' | 'large';
    };
    watermark?: string;
  }): void {
    this.http
      .post<GeneratedThumbnail>(`${this.baseUrl}/api/v1/workflow/generate-thumbnail`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.analyzeStore.setGeneratedThumbnail(response);
        }),
      )
      .subscribe();
  }
}
