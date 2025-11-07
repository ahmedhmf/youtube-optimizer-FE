import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../services/auth';
import { DASHBOARD_URL, LOGIN_URL, PROFILE_URL } from '../util/urls.constants';
import { LayoutStore } from '../stores/layout.store';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout {
  protected store = inject(LayoutStore);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.store.setPagesLinks([
      { label: 'Features', action: (): void => this.scrollToSection('features') },
      { label: 'How It Works', action: (): void => this.scrollToSection('how-it-works') },
      { label: 'Pricing', action: (): void => this.scrollToSection('pricing') }
    ])
    this.checkAuthStatus();

    this.authService.client.auth.onAuthStateChange((event, session) => {
      this.store.setIsAuthenticated(!!session);
      this.store.setUser(session?.user || null);
    });
  }

  private async checkAuthStatus(): Promise<void> {
    try {
      const { data: { session } } = await this.authService.client.auth.getSession();
      this.store.setIsAuthenticated(!!session);
      this.store.setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking auth status:', error);
      this.store.setIsAuthenticated(false);
      this.store.setUser(null);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.client.auth.signOut();
      this.store.setIsAuthenticated(false);
      this.store.setUser(null);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  goToLogin(): void {
    this.router.navigate([LOGIN_URL]);
  }

  goToProfile(): void {
    this.router.navigate([PROFILE_URL]);
  }

  goToDashboard(): void {
    this.router.navigate([DASHBOARD_URL]);
  }

  toggleSidenav(): void {
    this.store.setSidenav(!this.store.sidenavOpened());
  }

  closeSidenav(): void {
    this.store.setSidenav(false);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
