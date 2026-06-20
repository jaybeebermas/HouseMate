import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UIConfigService, UIScale } from '../../../../services';
import { Router } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <header class="flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 backdrop-blur-md px-6 sticky top-0 z-30">
      <div class="flex items-center gap-4">
        <!-- Simplified Sidebar Toggle -->
        <button 
          (click)="toggleSidebar.emit()"
          class="text-zinc-500 hover:text-primary-600 transition-all active:scale-90 group outline-none flex items-center justify-center">
          <ng-icon name="heroBars3" class="h-7 w-7 transition-all group-hover:scale-105" strokeWidth="2.2"></ng-icon>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <!-- UI Scaling Selector -->
        <div class="hidden lg:flex items-center bg-zinc-100 p-1 rounded-xl gap-1">
          <button 
            *ngFor="let size of sizes"
            (click)="uiConfig.setScale(size)"
            [class.bg-white]="uiConfig.scale() === size"
            [class.shadow-sm]="uiConfig.scale() === size"
            [class.text-primary-600]="uiConfig.scale() === size"
            [class.text-zinc-500]="uiConfig.scale() !== size"
            class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:text-primary-500 active:scale-90">
            {{ size }}
          </button>
        </div>

        <div class="h-8 w-[1px] bg-zinc-100 mx-2 hidden lg:block"></div>

        <button (click)="toggleFullscreen()" class="p-2 text-zinc-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
          <ng-icon name="heroArrowsPointingOut" class="h-4 w-4" strokeWidth="2"></ng-icon>
        </button>

        <!-- User Menu Dropdown -->
        <div class="relative flex items-center">
          <button 
            (click)="toggleUserMenu()"
            class="flex items-center gap-3 pl-2 group outline-none">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-bold text-zinc-900 leading-none group-hover:text-primary-600 transition-colors">{{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}</p>
              <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">@{{ authService.currentUser()?.username }}</p>
            </div>
            <div class="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary-600/20 group-hover:shadow-primary-600/40 transition-all active:scale-95">
              {{ authService.currentUser()?.first_name?.[0] }}{{ authService.currentUser()?.last_name?.[0] }}
            </div>
          </button>

          <!-- Dropdown Menu -->
          <div 
            *ngIf="userMenuOpen()"
            class="absolute right-0 top-12 w-56 bg-white border border-zinc-100 rounded-2xl shadow-elevated p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            <div class="px-4 py-3 border-b border-zinc-50 mb-1">
              <p class="text-xs font-black text-zinc-900 truncate">{{ authService.currentUser()?.email }}</p>
              <p class="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">{{ getUserRoleName() }}</p>
            </div>
            
            <!-- Mobile Size Toggle -->
            <div class="lg:hidden p-2 grid grid-cols-2 gap-1 border-b border-zinc-50 mb-1">
               <button 
                *ngFor="let size of sizes"
                (click)="uiConfig.setScale(size)"
                [class.bg-zinc-50]="uiConfig.scale() === size"
                [class.text-primary-600]="uiConfig.scale() === size"
                class="px-2 py-1.5 text-[9px] font-black uppercase rounded-lg text-center transition-all">
                {{ size }}
              </button>
            </div>

            <button 
              (click)="logout()"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all group">
              <ng-icon name="heroArrowRightOnRectangle" class="h-4 w-4 text-zinc-300 group-hover:text-accent-500" strokeWidth="2.5"></ng-icon>
              <span>Sign Out</span>
            </button>
          </div>

          <!-- Overlay to close menu -->
          <div *ngIf="userMenuOpen()" (click)="toggleUserMenu()" class="fixed inset-0 z-40 bg-transparent"></div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() sidebarOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  getUserRoleName(): string {
    const role = this.authService.currentUser()?.role;
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  authService = inject(AuthService);
  uiConfig = inject(UIConfigService);
  private router = inject(Router);
  
  userMenuOpen = signal(false);
  sizes: UIScale[] = ['small', 'medium', 'large', 'xl'];

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout(true).subscribe();
  }

  async toggleFullscreen(): Promise<void> {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }
}
