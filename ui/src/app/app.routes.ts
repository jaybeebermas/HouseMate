import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { adminRoutes } from './admin/admin.routes';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: adminRoutes
  },
  {
    path: 'become-landlord',
    canActivate: [authGuard],
    loadComponent: () => import('./features/become-landlord/become-landlord.component').then(m => m.BecomeLandlordComponent)
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
