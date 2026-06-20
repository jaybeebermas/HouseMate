import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'users', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },
            { path: '', redirectTo: 'users', pathMatch: 'full' }
        ]
    }
];
