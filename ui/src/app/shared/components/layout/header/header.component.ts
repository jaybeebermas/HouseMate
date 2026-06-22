import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UIConfigService, UIScale } from '../../../../services';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 sticky top-0 z-30">
      <div class="flex items-center gap-4">
        <button 
          (click)="toggleSidebar.emit()"
          class="text-[#485366] hover:text-[#18305E] transition-all active:scale-90 group outline-none flex items-center justify-center">
          <ng-icon name="heroBars3" class="h-7 w-7 transition-all group-hover:scale-105" strokeWidth="2.2"></ng-icon>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden lg:flex items-center bg-[#F4F6F9] p-1 rounded-xl gap-1">
          <button 
            *ngFor="let size of sizes"
            (click)="uiConfig.setScale(size)"
            [class.bg-[#CEEBFF]]="uiConfig.scale() === size"
            [class.text-[#18305E]]="uiConfig.scale() === size"
            [class.text-[#485366]]="uiConfig.scale() !== size"
            class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-[#CEEBFF] hover:text-[#18305E] active:scale-90">
            {{ size }}
          </button>
        </div>

        <div class="h-8 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>

        <button (click)="toggleFullscreen()" class="p-2 text-[#727272] hover:text-[#18305E] hover:bg-[#CEEBFF] rounded-lg transition-all">
          <ng-icon name="heroArrowsPointingOut" class="h-4 w-4" strokeWidth="2"></ng-icon>
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
