import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <h2 class="text-2xl font-bold text-[#18305E] tracking-tight">{{ title }}</h2>
        <p class="text-[#727272] mt-1 text-sm">{{ subtitle }}</p>
      </div>
      <button
        *ngIf="actionLabel && hasActionPermission()"
        (click)="actionClick.emit()"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#18305E] to-[#254685] text-white text-sm font-semibold rounded-md hover:from-[#254685] hover:to-[#18305E] active:scale-[0.97] transition-all shadow-lg shadow-[#18305E]/20 whitespace-nowrap">
        <ng-container *ngIf="!customIcon; else iconTemplate">
          <ng-icon name="heroPlus" class="h-4 w-4" strokeWidth="2.5"></ng-icon>
        </ng-container>
        <ng-template #iconTemplate>
          <span [innerHTML]="customIcon"></span>
        </ng-template>
        {{ actionLabel }}
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
