import type { Routes } from '@angular/router';
import { publicGuard } from './guard/public.guard';
import { authGuard } from './guard/auth.guard';
// import { publicGuard } from './guard/public.guard';
// import { authGuard } from './guard/auth.guard';

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
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
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
    ],
  },
  // Auth routes (no layout)
  // {
  //     path: 'login',
  //     loadComponent: () => import('./pages/login/login').then(m => m.LoginPageComponent),
  //     canActivate: [publicGuard]
  // },
  // {
  //     path: 'register',
  //     loadComponent: () => import('./pages/register/register').then(m => m.Register),
  //     canActivate: [publicGuard]
  // },

  // {
  //     path: '',
  //     loadComponent: () => import('./layout/layout').then(m => m.Layout),
  //     children: [
  //         {
  //             path: '',
  //             pathMatch: 'full',
  //             loadComponent: () => import('./pages/home/home').then(m => m.Home),
  //             canActivate: [publicGuard],
  //         },
  //         {
  //             path: 'dashboard',
  //             loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
  //             canActivate: [authGuard],
  //             children: [
  //                 {
  //                     path: 'analyze-video',
  //                     loadComponent: () => import('./pages/dashboard/pages/analyze-video/analyze-video').then(m => m.AnalyzeVideo),
  //                     canActivate: [authGuard]
  //                 }
  //             ]
  //         },
  //         {
  //             path: 'home',
  //             loadComponent: () => import('./pages/home/home').then(m => m.Home),
  //             canActivate: [authGuard]
  //         },
  //         {
  //             path: 'profile',
  //             loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
  //             canActivate: [authGuard]
  //         }
  //     ]
  // },

  // // Wildcard route - redirect to login if not authenticated
  // {
  //     path: '**',
  //     redirectTo: '/'
  // }
];
