import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { ApiError } from '../models/api-error.model';
import { ErrorHandlerService } from '../util/error-handler.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  private errorHandler = inject(ErrorHandlerService);
  public error$ = new Subject<ApiError>();

  constructor() {
    this.supabase = createClient(
      'https://idhvaindezqzzgghjqlf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaHZhaW5kZXpxenpnZ2hqcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Nzk5MjIsImV4cCI6MjA3NzU1NTkyMn0.nZk32owZPIhK3wxNU3n38y4DbphhQcmunop2aXVUeoU'
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data?.user ?? null;
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) {
        const handledError = this.errorHandler.handle({
          status: error.status || 400,
          error: { message: error.message }
        });
        this.error$.next(handledError);
      }
    } catch (error: any) {
      const handledError = this.errorHandler.handle(error);
      this.error$.next(handledError);
    }
  }
}
