import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;

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
}
