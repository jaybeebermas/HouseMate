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
      class="fixed inset-y-0 left-0 z-50 flex h-full flex-col overflow-hidden border-r border-slate-200 bg-[#F4F6F9] transition-all duration-200 select-none lg:relative lg:z-40 lg:translate-x-0"
      [class.w-64]="isOpen"
      [class.w-0]="!isOpen"
      [class.-translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen">

      <!-- Brand Area -->
      <div class="px-5 py-6">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded flex items-center justify-center overflow-hidden"
               [ngClass]="configService.logoUrl() ? 'bg-transparent' : 'bg-[#18305E]'">
             <img *ngIf="configService.logoUrl()" [src]="configService.logoUrl()" class="h-full w-full object-cover">
             <div *ngIf="!configService.logoUrl()" class="h-full w-full bg-[#18305E] flex items-center justify-center text-white font-bold text-sm">HM</div>
          </div>
          <div class="transition-opacity duration-200" [class.opacity-0]="!isOpen">
            <h2 class="text-base font-semibold text-[#18305E]">House<span class="text-[#485366]">Sync</span></h2>
            <p class="text-xs text-[#727272] mt-0.5">{{ getUserRoleName() }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-0.5">
        <!-- Dashboard Always Top -->
        <a
          routerLink="/admin/dashboard"
          routerLinkActive="bg-[#CEEBFF] text-[#18305E] font-semibold"
          #rlaDashboard="routerLinkActive"
          class="flex h-9 items-center gap-3 rounded px-3 text-sm font-medium text-[#485366] hover:bg-[#CEEBFF] transition-colors"
          [routerLinkActiveOptions]="{exact: true}">
          <ng-icon 
            [name]="rlaDashboard.isActive ? 'heroHomeModernSolid' : 'heroHomeModern'" 
            class="h-5 w-5 shrink-0"
            [class.text-[#18305E]]="rlaDashboard.isActive"></ng-icon>
          <span class="truncate">Dashboard</span>
        </a>

        <!-- User Management -->
        <a
          routerLink="/admin/users"
          routerLinkActive="bg-[#CEEBFF] text-[#18305E] font-semibold"
          #rlaUsers="routerLinkActive"
          class="flex h-9 items-center gap-3 rounded px-3 text-sm font-medium text-[#485366] hover:bg-[#CEEBFF] transition-colors"
          [routerLinkActiveOptions]="{exact: true}">
          <ng-icon 
            [name]="rlaUsers.isActive ? 'heroUserGroupSolid' : 'heroUserGroup'" 
            class="h-5 w-5 shrink-0"
            [class.text-[#18305E]]="rlaUsers.isActive"></ng-icon>
          <span class="truncate">User Management</span>
        </a>

        <!-- Dynamic Items -->
        <div *ngFor="let section of filteredNavItems()">
          <!-- Simple Item -->
          <a
            *ngIf="section.type === 'item' && isValidRoute(section.route)"
            [routerLink]="section.route"
            routerLinkActive="bg-[#CEEBFF] text-[#18305E] font-semibold"
            #rla="routerLinkActive"
            class="flex h-9 items-center gap-3 rounded px-3 text-sm font-medium text-[#485366] hover:bg-[#CEEBFF] transition-colors"
            [routerLinkActiveOptions]="{exact: true}">
            <ng-icon 
              [name]="getIconName(section.icon, rla.isActive)" 
              class="h-5 w-5 shrink-0"
              [class.text-[#18305E]]="rla.isActive"></ng-icon>
            <span class="truncate">{{ section.title }}</span>
          </a>

          <!-- Group/Collapsible -->
          <div *ngIf="section.type === 'group' || section.type === 'collapsible'">
            <button
              type="button"
              class="flex h-9 w-full items-center gap-3 rounded px-3 text-left text-sm font-medium text-[#485366] hover:bg-[#CEEBFF] transition-colors"
              (click)="toggleSection(section)">
              <ng-icon 
                [name]="getIconName(section.icon)" 
                class="h-5 w-5 shrink-0"></ng-icon>
              <span class="truncate flex-1">{{ section.title }}</span>
              <ng-icon 
                name="heroChevronRight" 
                class="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 text-[#727272]"
                [class.rotate-90]="section._open"></ng-icon>
            </button>

            <!-- Children -->
            <div
              class="overflow-hidden transition-all duration-200 pl-8"
              [class.max-h-[500px]]="section._open"
              [class.max-h-0]="!section._open">
              <div *ngFor="let item of section.children">
                <a
                  *ngIf="item.type === 'item' && (!item.permission || authService.hasPermission(item.permission))"
                  [routerLink]="item.route"
                  routerLinkActive="bg-[#CEEBFF] text-[#18305E] font-semibold"
                  #rlaChild="routerLinkActive"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="flex h-8 items-center gap-2 rounded px-3 text-sm font-medium text-[#485366] hover:bg-[#CEEBFF] transition-colors">
                  <ng-icon 
                    *ngIf="item.icon"
                    [name]="getIconName(item.icon, rlaChild.isActive)" 
                    class="h-4 w-4 shrink-0"
                    [class.text-[#18305E]]="rlaChild.isActive"></ng-icon>
                  <span class="truncate">{{ item.title }}</span>
                </a>
                
                <!-- Non-link child -->
                <div 
                  *ngIf="item.type === 'item' && !isValidRoute(item.route) && (!item.permission || authService.hasPermission(item.permission))"
                  class="flex h-8 items-center gap-2 px-3 text-sm text-[#727272] cursor-default">
                  <span class="truncate">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Non-link top-level -->
          <div 
            *ngIf="section.type === 'item' && !isValidRoute(section.route)"
            class="flex h-9 items-center gap-3 px-3 text-sm text-[#727272] cursor-default">
            <ng-icon 
              [name]="getIconName(section.icon)" 
              class="h-5 w-5 shrink-0 text-[#727272]"></ng-icon>
            <span class="truncate">{{ section.title }}</span>
          </div>
        </div>
      </nav>
      <!-- User Info -->
      <div class="border-t border-slate-200 px-3 py-3">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded bg-[#18305E] flex items-center justify-center text-white font-bold text-xs">
            {{ authService.currentUser()?.first_name?.[0] }}{{ authService.currentUser()?.last_name?.[0] }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#18305E] truncate">{{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}</p>
            <p class="text-xs text-[#727272] truncate">{{ authService.currentUser()?.email }}</p>
          </div>
        </div>
      </div>
      <!-- Sign Out -->
      <div class="border-t border-slate-200 px-3 py-3">
        <button
          (click)="logout()"
          class="flex h-9 w-full items-center gap-3 rounded px-3 text-sm font-medium text-[#485366] hover:bg-red-50 hover:text-red-600 transition-colors">
          <ng-icon name="heroArrowRightOnRectangle" class="h-5 w-5 shrink-0"></ng-icon>
          <span class="truncate">Sign out</span>
        </button>
      </div>
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
