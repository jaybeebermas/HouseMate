import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { adminRoutes } from './admin/admin.routes';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: adminRoutes
  },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    pathMatch: 'full'
  },
  { path: '**', redirectTo: 'login' }
];
