import type { Routes } from '@angular/router';
import { publicGuard } from './guard/public.guard';
import { jwtAuthGuard } from './guard/jwt-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    canActivate: [publicGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
    canActivate: [publicGuard],
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth/oauth-callback/oauth-callback').then((m) => m.OAuthCallback),
  },
  {
    path: 'auth/github/callback',
    loadComponent: () =>
      import('./pages/auth/github-callback/github-callback').then((m) => m.GitHubCallbackComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/layout/layout').then((m) => m.Layout),
    canActivate: [jwtAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/views/home/home').then((m) => m.Home),
      },
      {
        path: 'analyze-url',
        loadComponent: () =>
          import('./pages/dashboard/views/analyze-url/analyze-url').then((m) => m.AnalyzeUrl),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/dashboard/views/history/history').then((m) => m.History),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/dashboard/views/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/layout/layout').then((m) => m.Layout),
    canActivate: [jwtAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/user-managment/user-managment').then((m) => m.UserManagment),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./pages/admin/user-managment/user-edit/user-edit').then((m) => m.UserEdit),
      },
      {
        path: 'video',
        loadComponent: () =>
          import('./pages/admin/video-analysis/video-analysis').then((m) => m.VideoAnalysis),
      },
      {
        path: 'billing',
        loadComponent: () => import('./pages/admin/billing/billing').then((m) => m.Billing),
      },
      {
        path: 'usage',
        loadComponent: () => import('./pages/admin/api/api').then((m) => m.Api),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/admin/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'logs',
        loadComponent: () => import('./pages/admin/logs/logs').then((m) => m.Logs),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin/settings/settings').then((m) => m.Settings),
      },
    ],
  },
];
