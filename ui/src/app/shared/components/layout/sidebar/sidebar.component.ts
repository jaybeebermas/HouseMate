import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { NavigationItem } from '../../../../shared/models/navigation.model';
import { AuthService } from '../../../../services/auth/auth.service';
import { filter } from 'rxjs';
import { BarangayConfigService } from '../../../../services/ui-config/barangay-config.service';

type NavNode = Omit<NavigationItem, 'children'> & {
  children: NavNode[];
  _open: boolean;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIconComponent],
  template: `
    <aside
      class="flex-col border-r border-[#2a5298]/30 bg-[#1a3a6b] shadow-xl shadow-[#0a1830]/20 select-none transition-all duration-300 overflow-hidden"
      [class.w-64]="isOpen"
      [class.w-0]="!isOpen"
      [class.h-full]="true"
      [class.max-lg:fixed]="true"
      [class.max-lg:inset-y-0]="true"
      [class.max-lg:left-0]="true"
      [class.max-lg:z-50]="true"
      [class.lg:relative]="true">

      <!-- Brand Area -->
      <div class="px-5 pt-6 pb-4">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-[#0a1830]/30"
               [ngClass]="configService.logoUrl() ? 'bg-transparent' : 'bg-gradient-to-br from-[#b5c9e8] to-[#dce8f7]'">
             <img *ngIf="configService.logoUrl()" [src]="configService.logoUrl()" class="h-full w-full object-cover">
             <div *ngIf="!configService.logoUrl()" class="h-full w-full flex items-center justify-center text-[#112649] font-bold text-sm">HM</div>
          </div>
           <div class="transition-all duration-200" [class.opacity-0]="!isOpen" [class.opacity-100]="isOpen">
             <h2 class="text-base font-bold text-[#dce8f7] tracking-tight">House<span class="text-[#7ea3cc] font-medium">Sync</span></h2>
             <p class="text-[11px] text-[#b5c9e8] font-medium mt-0.5">{{ getUserRoleName() }}</p>
           </div>
         </div>
       </div>

      <!-- Navigation Label -->
      <div class="px-5 pb-1" [class.opacity-0]="!isOpen">
        <p class="text-[10px] font-bold text-[#7ea3cc]/60 uppercase tracking-[0.15em]">Menu</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 space-y-0.5">
        <!-- Dashboard Always Top -->
        <a
          routerLink="/admin/dashboard"
          routerLinkActive="bg-[#2a5298] text-white font-medium shadow-sm"
          #rlaDashboard="routerLinkActive"
          class="relative flex h-9 items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-[#b5c9e8] hover:bg-[#2a5298]/40 hover:text-[#dce8f7] transition-all"
          [routerLinkActiveOptions]="{exact: true}">
          <span *ngIf="rlaDashboard.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full"></span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-[18px] w-[18px] shrink-0"
               [class.text-white]="rlaDashboard.isActive">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span class="truncate">Dashboard</span>
        </a>

        <!-- User Management -->
        <a
          routerLink="/admin/users"
          routerLinkActive="bg-[#2a5298] text-white font-medium shadow-sm"
          #rlaUsers="routerLinkActive"
          class="relative flex h-9 items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-[#b5c9e8] hover:bg-[#2a5298]/40 hover:text-[#dce8f7] transition-all"
          [routerLinkActiveOptions]="{exact: true}">
          <span *ngIf="rlaUsers.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full"></span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-[18px] w-[18px] shrink-0"
               [class.text-white]="rlaUsers.isActive">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <span class="truncate">User Management</span>
        </a>

        <!-- Dynamic Items -->
        <div *ngFor="let section of filteredNavItems()">
          <!-- Simple Item -->
          <a
            *ngIf="section.type === 'item' && isValidRoute(section.route)"
            [routerLink]="section.route"
            routerLinkActive="bg-[#2a5298] text-white font-medium shadow-sm"
            #rla="routerLinkActive"
            class="relative flex h-9 items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-[#b5c9e8] hover:bg-[#2a5298]/40 hover:text-[#dce8f7] transition-all"
            [routerLinkActiveOptions]="{exact: true}">
            <span *ngIf="rla.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full"></span>
            <ng-icon 
              [name]="getIconName(section.icon, rla.isActive)" 
              class="h-[18px] w-[18px] shrink-0"
              [class.text-white]="rla.isActive"></ng-icon>
            <span class="truncate">{{ section.title }}</span>
          </a>

          <!-- Group/Collapsible -->
          <div *ngIf="section.type === 'group' || section.type === 'collapsible'">
            <button
              type="button"
              class="flex h-9 w-full items-center gap-3 px-3 py-2.5 rounded-md text-left text-[13px] text-[#b5c9e8] hover:bg-[#2a5298]/40 hover:text-[#dce8f7] transition-all"
              (click)="toggleSection(section)">
              <ng-icon 
                [name]="getIconName(section.icon)" 
                class="h-[18px] w-[18px] shrink-0"></ng-icon>
              <span class="truncate flex-1">{{ section.title }}</span>
              <ng-icon 
                name="heroChevronRight" 
                class="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-[#7ea3cc]/50"
                [class.rotate-90]="section._open"></ng-icon>
            </button>

            <!-- Children -->
            <div
              class="overflow-hidden transition-all duration-200 pl-10"
              [class.max-h-[500px]]="section._open"
              [class.max-h-0]="!section._open">
              <div *ngFor="let item of section.children">
                <a
                  *ngIf="item.type === 'item' && (!item.permission || authService.hasPermission(item.permission))"
                  [routerLink]="item.route"
                  routerLinkActive="text-white font-medium"
                  #rlaChild="routerLinkActive"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="flex h-8 items-center gap-2 px-3 py-2 rounded-md text-[13px] text-[#b5c9e8] hover:bg-[#2a5298]/40 hover:text-[#dce8f7] transition-all">
                  <ng-icon 
                    *ngIf="item.icon"
                    [name]="getIconName(item.icon, rlaChild.isActive)" 
                    class="h-3.5 w-3.5 shrink-0"
                    [class.text-white]="rlaChild.isActive"></ng-icon>
                  <span class="truncate">{{ item.title }}</span>
                </a>
                
                <!-- Non-link child -->
                <div 
                  *ngIf="item.type === 'item' && !isValidRoute(item.route) && (!item.permission || authService.hasPermission(item.permission))"
                  class="flex h-8 items-center gap-2 px-3 py-2 rounded-md text-[13px] text-[#7ea3cc]/50 cursor-default">
                  <span class="truncate">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Non-link top-level -->
          <div 
            *ngIf="section.type === 'item' && !isValidRoute(section.route)"
            class="flex h-9 items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-[#7ea3cc]/50 cursor-default">
            <ng-icon 
              [name]="getIconName(section.icon)" 
              class="h-[18px] w-[18px] shrink-0 text-[#7ea3cc]/50"></ng-icon>
            <span class="truncate">{{ section.title }}</span>
          </div>
        </div>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() closeSidebar = new EventEmitter<void>();

  public readonly configService = inject(BarangayConfigService);

  getUserRoleName(): string {
    const role = this.authService.currentUser()?.role;
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  private _navItems: NavNode[] = [];

  @Input()
  set navItems(value: NavNode[]) {
    this._navItems = value;
    this.autoExpandActiveSection();
  }

  get navItems(): NavNode[] {
    return this._navItems;
  }

  private router = inject(Router);
  public readonly authService = inject(AuthService);
  private validRoutes = new Set<string>();

  constructor() {
    // We defer the extraction slightly to ensure the router config is fully available
    setTimeout(() => this.extractValidRoutes(), 0);

    // Listen to router navigation end events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.autoExpandActiveSection();
      // Auto-close sidebar on mobile after navigating
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        this.closeSidebar.emit();
      }
    });
  }

  autoExpandActiveSection(): void {
    if (!this.navItems) return;
    const currentUrl = this.router.url.split('?')[0];

    for (const section of this.navItems) {
      if (section.type === 'group' || section.type === 'collapsible') {
        let hasActiveChild = false;
        if (section.children) {
          for (const child of section.children) {
            if (child.route && child.route === currentUrl) {
              hasActiveChild = true;
              break;
            }
          }
        }
        section._open = hasActiveChild;
      }
    }
  }

  private extractValidRoutes(): void {
    const traverse = (config: any[], prefix = '') => {
      for (const route of config) {
        if (route.path === '**') continue;

        let currentPath = prefix;
        if (route.path) {
          currentPath = currentPath.endsWith('/')
            ? `${currentPath}${route.path}`
            : `${currentPath}/${route.path}`;
        }

        if (route.component || route.loadComponent) {
          this.validRoutes.add(currentPath);
        }

        if (route.children) {
          traverse(route.children, currentPath);
        }
      }
    };

    traverse(this.router.config, '');
  }

  filteredNavItems(): NavNode[] {
    return this.navItems.filter(item => {
      const route = (item.route || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      if (route === '/admin/dashboard' || route === 'dashboard' || title === 'dashboard' || title === 'user management') {
        return false;
      }
      if (item.permission && !this.authService.hasPermission(item.permission)) {
        return false;
      }
      return true;
    });
  }

  isValidRoute(route?: string | null): boolean {
    if (!route) return false;
    const clean = route.trim();
    if (clean === '' || clean === '#' || clean === '/') return false;

    // Only return true if the route is actually registered in the Angular Router
    return this.validRoutes.has(clean);
  }

  toggleSection(section: NavNode): void {
    section._open = !section._open;
  }

  logout(): void {
    this.authService.logout(true).subscribe();
  }

  getIconName(name?: string | null, isSolid = false): string {
    const raw = (name ?? '').trim();
    if (!raw) return isSolid ? 'heroHomeModernSolid' : 'heroHomeModern';

    // Map common names to Heroicon names
    const mapping: Record<string, string> = {
      'home-modern': 'heroHomeModern',
      'users': 'heroUsers',
      'user-group': 'heroUserGroup',
      'shield-check': 'heroShieldCheck',
      'document-text': 'heroDocumentText',
      'presentation-chart-line': 'heroPresentationChartLine',
      'bell': 'heroBell',
      'calendar': 'heroCalendar',
      'map': 'heroMap',
      'chat-bubble-left-right': 'heroChatBubbleLeftRight',
      'cog-6-tooth': 'heroCog6Tooth',
      'building-library': 'heroBuildingLibrary',
      'finger-print': 'heroFingerPrint',
      'identification': 'heroIdentification',
      'briefcase': 'heroBriefcase',
      'chart-bar': 'heroChartBar',
      'clipboard-document-check': 'heroClipboardDocumentCheck',
      'square-3-stack-3d': 'heroSquare3Stack3d',
      'archive-box': 'heroArchiveBox',
      'queue-list': 'heroQueueList',
      'user-circle': 'heroUserCircle'
    };

    let iconName = mapping[raw];

    if (!iconName) {
      if (raw.includes(':')) {
        const part = raw.split(':')[1];
        const camel = part.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        iconName = `hero${camel}`;
      } else {
        const camel = raw.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        iconName = `hero${camel}`;
      }
    }

    if (isSolid) {
      // Check if we have a solid version (we only provided a few in app.config.ts)
      const solids = ['heroHomeModern', 'heroUsers', 'heroUserGroup', 'heroShieldCheck', 'heroDocumentText', 'heroCog6Tooth'];
      if (solids.includes(iconName)) {
        return `${iconName}Solid`;
      }
    }

    return iconName;
  }
}
