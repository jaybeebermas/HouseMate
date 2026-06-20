import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get currentUser(): User | null {
    return this.authService.currentUser();
  }

  goToLogin(signup: boolean = false): void {
    if (signup) {
      this.router.navigate(['/login'], { queryParams: { mode: 'signup' } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
