import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-1">
      <div>
        <h2 class="text-2xl font-black text-zinc-900 tracking-tight">{{ title }}</h2>
        <p class="text-zinc-500 font-medium mt-1 text-sm">{{ subtitle }}</p>
      </div>
      <button
        *ngIf="actionLabel && hasActionPermission()"
        (click)="actionClick.emit()"
        class="btn-primary !py-2.5 !px-6 !text-xs shadow-lg shadow-primary-600/10 whitespace-nowrap">
        <span class="flex items-center gap-2">
          <ng-container *ngIf="!customIcon; else iconTemplate">
            <ng-icon name="heroPlus" class="h-4 w-4" strokeWidth="3"></ng-icon>
          </ng-container>
          <ng-template #iconTemplate>
            <span [innerHTML]="customIcon"></span>
          </ng-template>
          {{ actionLabel }}
        </span>
      </button>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() actionLabel?: string;
  @Input() customIcon?: string;
  @Input() permission?: string;
  @Output() actionClick = new EventEmitter<void>();

  private readonly authService: AuthService = inject(AuthService);

  hasActionPermission(): boolean {
    if (!this.permission) return true;
    return this.authService.hasPermission(this.permission);
  }
}
