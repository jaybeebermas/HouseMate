import { Component, inject, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UIConfigService, UIScale } from '../../../../services';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterLink],
  template: `
    <header class="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-3 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div class="flex items-center gap-2 sm:gap-4 min-w-0">
        <button 
          (click)="toggleSidebar.emit()"
          class="text-[#485366] hover:text-[#18305E] transition-all active:scale-90 group outline-none flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-[#CEEBFF]/50 shrink-0">
          <ng-icon name="heroBars3" class="h-5 w-5 sm:h-6 sm:w-6 transition-all group-hover:scale-105" strokeWidth="2.2"></ng-icon>
        </button>

        <!-- Breadcrumb -->
        <div class="hidden sm:flex items-center gap-2 text-sm min-w-0">
          <span class="text-[#485366] font-medium truncate">{{ pageTitle }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-3">
        <!-- Font Size Toggle -->
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

        <div class="h-6 sm:h-7 w-px bg-slate-200 mx-0.5 hidden lg:block"></div>

        <!-- Notification Bell -->
        <button class="relative p-1.5 sm:p-2 text-[#727272] hover:text-[#18305E] hover:bg-[#CEEBFF]/50 rounded-lg transition-all active:scale-90">
          <ng-icon name="heroBell" class="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth="1.8"></ng-icon>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <!-- Fullscreen Toggle -->
        <button (click)="toggleFullscreen()" class="hidden sm:flex p-1.5 sm:p-2 text-[#727272] hover:text-[#18305E] hover:bg-[#CEEBFF]/50 rounded-lg transition-all active:scale-90">
          <ng-icon [name]="isFullscreen ? 'heroArrowsPointingIn' : 'heroArrowsPointingOut'" class="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth="2"></ng-icon>
        </button>

        <div class="h-6 sm:h-7 w-px bg-slate-200 mx-0.5"></div>

        <!-- User Avatar Dropdown -->
        <div class="relative" #userMenu>
          <button (click)="toggleDropdown($event)"
            class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#CEEBFF]/50 transition-all active:scale-95 group">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#18305E] to-[#254685] flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shrink-0">
              {{ authService.currentUser()?.first_name?.[0] }}{{ authService.currentUser()?.last_name?.[0] }}
            </div>
            <div class="hidden md:block text-left min-w-0">
              <p class="text-[12px] font-semibold text-[#18305E] leading-tight truncate max-w-[120px]">
                {{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}
              </p>
              <p class="text-[9px] text-[#a1a1aa] font-medium uppercase tracking-wider truncate max-w-[120px]">
                {{ getUserRole() }}
              </p>
            </div>
            <ng-icon name="heroChevronDown" class="h-3 w-3 text-[#a1a1aa] transition-transform duration-200 shrink-0"
                     [class.rotate-180]="dropdownOpen"></ng-icon>
          </button>

          <!-- Dropdown Menu -->
          <div *ngIf="dropdownOpen"
               class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200/80 shadow-elevated py-1.5 z-50 animate-fade-in-up"
               (click)="dropdownOpen = false">
            <div class="px-4 py-2 border-b border-slate-100">
              <p class="text-sm font-bold text-[#18305E]">{{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}</p>
              <p class="text-[11px] text-[#727272] font-medium truncate">{{ authService.currentUser()?.email }}</p>
            </div>
            <a routerLink="/admin/dashboard" class="flex items-center gap-3 px-4 py-2.5 text-sm text-[#485366] hover:bg-slate-50 hover:text-[#18305E] transition-colors">
              <ng-icon name="heroUserCircle" class="h-4 w-4 text-[#a1a1aa]"></ng-icon>
              My Profile
            </a>
            <a routerLink="/admin/dashboard" class="flex items-center gap-3 px-4 py-2.5 text-sm text-[#485366] hover:bg-slate-50 hover:text-[#18305E] transition-colors">
              <ng-icon name="heroCog6Tooth" class="h-4 w-4 text-[#a1a1aa]"></ng-icon>
              Settings
            </a>
            <div class="border-t border-slate-100 mt-1 pt-1">
              <button (click)="logout()" class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <ng-icon name="heroArrowRightOnRectangle" class="h-4 w-4"></ng-icon>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.15s ease-out both;
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  uiConfig = inject(UIConfigService);
  router = inject(Router);
  elementRef = inject(ElementRef);
  sizes: UIScale[] = ['small', 'medium', 'large', 'xl'];
  dropdownOpen = false;
  isFullscreen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/users')) return 'User Management';
    if (url.includes('/settings')) return 'Settings';
    return 'Dashboard';
  }

  getUserRole(): string {
    const role = this.authService.currentUser()?.role;
    if (!role) return '';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  logout(): void {
    this.authService.logout(true).subscribe();
  }

  async toggleFullscreen(): Promise<void> {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      this.isFullscreen = false;
    } else {
      await document.documentElement.requestFullscreen();
      this.isFullscreen = true;
    }
  }
}
