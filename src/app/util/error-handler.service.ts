import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  handle(error: HttpErrorResponse | any): ApiError {
    // Network/Connection errors
    if (error.status === 0 || !error.status) {
      return {
        message: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
        status: 0
      };
    }

    const { status, error: errorData } = error;
    
    switch (status) {
      case 400:
        return this.handleBadRequest(errorData);
      case 401:
        return this.handleUnauthorized(errorData);
      case 413:
        return this.handlePayloadTooLarge(errorData);
      case 429:
        return this.handleRateLimit(errorData);
      case 500:
        return this.handleServerError(errorData);
      default:
        return {
          message: errorData?.message || "An unexpected error occurred",
          code: "UNKNOWN_ERROR",
          status
        };
    }
  }

  private handleBadRequest(data: any): ApiError {
    const message = data?.message || "";
    
    // YouTube Service Errors
    if (message.includes("Video not found or private")) {
      return {
        message: "This video is not accessible. It may be private, deleted, or the URL is incorrect.",
        code: "VIDEO_NOT_FOUND"
      };
    }
    
    if (message.includes("Invalid YouTube URL")) {
      return {
        message: "Please enter a valid YouTube video URL.",
        code: "INVALID_URL"
      };
    }

    // File Upload Errors
    if (message.includes("No video file uploaded")) {
      return {
        message: "Please select a video file to upload.",
        code: "NO_FILE_UPLOADED"
      };
    }

    if (message.includes("Unsupported file type")) {
      return {
        message: "Unsupported file format. Please upload MP4, WebM, MOV, MP3, or WAV files.",
        code: "UNSUPPORTED_FILE_TYPE"
      };
    }

    return {
      message: data?.message || "Invalid request. Please check your input.",
      code: "BAD_REQUEST"
    };
  }

  private handleUnauthorized(data: any): ApiError {
    return {
      message: "Your session has expired. Please log in again.",
      code: "UNAUTHORIZED"
    };
  }

  private handlePayloadTooLarge(data: any): ApiError {
    return {
      message: "File is too large. Please upload a file smaller than 200MB.",
      code: "FILE_TOO_LARGE"
    };
  }

  private handleRateLimit(data: any): ApiError {
    const message = data?.message || "";
    
    if (message.includes("Free plan limit reached")) {
      return {
        message: "You've reached your free plan limit of 100 analyses. Please upgrade to continue.",
        code: "PLAN_LIMIT_REACHED"
      };
    }

    return {
      message: "Rate limit exceeded. Please try again later.",
      code: "RATE_LIMIT"
    };
  }

  private handleServerError(data: any): ApiError {
    const message = data?.message || "";
    
    // Database Errors
    if (message.includes("Database table 'audits' does not exist")) {
      return {
        message: "Service temporarily unavailable. Please try again later.",
        code: "DATABASE_ERROR"
      };
    }

    // AI Service Errors
    if (message.includes("transcription failed") || message.includes("Whisper")) {
      return {
        message: "Audio transcription failed. Please try with a different file or try again later.",
        code: "TRANSCRIPTION_ERROR"
      };
    }

    // Storage Errors
    if (message.includes("upload failed") || message.includes("Supabase upload")) {
      return {
        message: "File upload failed. Please try again.",
        code: "UPLOAD_ERROR"
      };
    }

    return {
      message: "Internal server error. Please try again later.",
      code: "SERVER_ERROR"
    };
  }
}