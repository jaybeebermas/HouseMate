import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  onUnderDevelopment(event: Event, featureName: string): void {
    event.preventDefault();
    this.toastService.show(`${featureName} is currently under development.`, 'info', 'Coming Soon');
  }
}
