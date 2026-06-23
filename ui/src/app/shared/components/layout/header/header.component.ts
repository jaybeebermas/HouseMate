import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UIConfigService, UIScale } from '../../../../services';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <header class="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-3 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div class="flex items-center gap-2 sm:gap-4">
        <button 
          (click)="toggleSidebar.emit()"
          class="text-[#485366] hover:text-[#18305E] transition-all active:scale-90 group outline-none flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-[#CEEBFF]/50">
          <ng-icon name="heroBars3" class="h-5 w-5 sm:h-6 sm:w-6 transition-all group-hover:scale-105" strokeWidth="2.2"></ng-icon>
        </button>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <div class="hidden lg:flex items-center bg-slate-100/80 p-0.5 rounded-xl gap-0.5 border border-slate-200/50">
          <button 
            *ngFor="let size of sizes"
            (click)="uiConfig.setScale(size)"
            [class.bg-white]="uiConfig.scale() === size"
            [class.text-[#18305E]]="uiConfig.scale() === size"
            [class.shadow-sm]="uiConfig.scale() === size"
            [class.text-[#727272]]="uiConfig.scale() !== size"
            class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all hover:text-[#18305E] active:scale-90">
            {{ size }}
          </button>
        </div>

        <div class="h-6 sm:h-7 w-px bg-slate-200 mx-0.5 sm:mx-1 hidden lg:block"></div>

        <button (click)="toggleFullscreen()" class="p-1.5 sm:p-2 text-[#727272] hover:text-[#18305E] hover:bg-[#CEEBFF]/50 rounded-lg transition-all active:scale-90">
          <ng-icon name="heroArrowsPointingOut" class="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth="2"></ng-icon>
        </button>

      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  uiConfig = inject(UIConfigService);
  sizes: UIScale[] = ['small', 'medium', 'large', 'xl'];

  async toggleFullscreen(): Promise<void> {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }
}
