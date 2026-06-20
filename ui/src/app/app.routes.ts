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
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
