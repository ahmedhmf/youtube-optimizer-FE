import { Routes } from '@angular/router';
import { publicGuard } from './guard/public.guard';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
    // Auth routes (no layout)
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.LoginPageComponent),
        canActivate: [publicGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.Register),
        canActivate: [publicGuard]
    },


    {
        path: '',
        loadComponent: () => import('./layout/layout').then(m => m.Layout),
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadComponent: () => import('./pages/home/home').then(m => m.Home),
                canActivate: [publicGuard],
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
                canActivate: [authGuard]
            },
            {
                path: 'home',
                loadComponent: () => import('./pages/home/home').then(m => m.Home),
                canActivate: [authGuard]
            },
            {
                path: 'profile',
                loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
                canActivate: [authGuard]
            }
        ]
    },

    // Wildcard route - redirect to login if not authenticated
    {
        path: '**',
        redirectTo: '/'
    }
];
