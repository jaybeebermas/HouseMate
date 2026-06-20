import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
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
      class="fixed inset-y-0 left-0 z-50 flex h-full flex-col overflow-hidden border-r border-teal-100 bg-[#f0fdfa] transition-all duration-300 ease-out select-none lg:relative lg:z-40 lg:translate-x-0"
      [class.w-72]="isOpen"
      [class.w-0]="!isOpen"
      [class.-translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen">
      
      <!-- Brand Area -->
      <div class="px-6 py-8">
        <div class="flex items-center gap-3">
          <div class="h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden transition-all shadow-xl"
               [ngClass]="configService.logoUrl() ? 'bg-transparent' : 'bg-gradient-to-br from-primary-600 to-primary-500 shadow-primary-600/20'">
             <!-- Uploaded Logo -->
             <img *ngIf="configService.logoUrl()" [src]="configService.logoUrl()" class="h-full w-full object-cover">
             <!-- Default Logo -->
             <div *ngIf="!configService.logoUrl()" class="h-full w-full bg-primary-600 flex items-center justify-center text-white font-black text-xl">HM</div>
          </div>
          <div class="transition-all duration-300" [class.opacity-0]="!isOpen" [class.translate-x-4]="!isOpen">
            <h2 class="text-xl font-black text-zinc-900 tracking-tight leading-none">House<span class="text-primary-600">Sync</span></h2>
            <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">{{ getUserRoleName() }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-none">
        <!-- Dashboard Always Top -->
        <a
          routerLink="/admin/dashboard"
          routerLinkActive="bg-zinc-200/80 text-primary-600 font-black shadow-sm"
          #rlaDashboard="routerLinkActive"
          class="group relative flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold text-zinc-500 hover:bg-zinc-200/80 hover:shadow-sm transition-all border border-transparent"
          [routerLinkActiveOptions]="{exact: true}">
          <div *ngIf="rlaDashboard.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-r-full"></div>
          <ng-icon 
            [name]="rlaDashboard.isActive ? 'heroHomeModernSolid' : 'heroHomeModern'" 
            class="h-5 w-5 shrink-0 transition-all" 
            [class.text-primary-600]="rlaDashboard.isActive"></ng-icon>
          <span class="truncate">Dashboard</span>
        </a>

        <!-- Dynamic Items -->
        <div *ngFor="let section of filteredNavItems()" class="mb-1">
          <!-- Simple Item -->
          <a
            *ngIf="section.type === 'item' && isValidRoute(section.route)"
            [routerLink]="section.route"
            routerLinkActive="bg-zinc-200/80 text-primary-600 font-black shadow-sm"
            #rla="routerLinkActive"
            class="group relative flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold text-zinc-500 hover:bg-zinc-200/80 hover:shadow-sm transition-all border border-transparent"
            [routerLinkActiveOptions]="{exact: true}">
            <div *ngIf="rla.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-r-full"></div>
            <ng-icon 
              [name]="getIconName(section.icon, rla.isActive)" 
              class="h-5 w-5 shrink-0 transition-all" 
              [class.text-primary-600]="rla.isActive"></ng-icon>
            <span class="truncate">{{ section.title }}</span>
          </a>

          <!-- Group/Collapsible -->
          <div *ngIf="section.type === 'group' || section.type === 'collapsible'" class="space-y-1">
            <button
              type="button"
              class="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold text-zinc-500 hover:bg-zinc-200/80 hover:shadow-sm transition-all group outline-none"
              (click)="toggleSection(section)">
              <ng-icon 
                [name]="getIconName(section.icon)" 
                class="h-5 w-5 shrink-0 transition-all group-hover:scale-110"></ng-icon>
              <span class="truncate flex-1">{{ section.title }}</span>
              <ng-icon 
                name="heroChevronRight" 
                class="ml-auto h-4 w-4 shrink-0 transition-transform duration-300 text-zinc-300 group-hover:text-zinc-500"
                [class.rotate-90]="section._open"></ng-icon>
            </button>

            <!-- Children -->
            <div
              class="overflow-hidden transition-all duration-300 ease-out pl-6 space-y-1"
              [class.max-h-[500px]]="section._open"
              [class.opacity-100]="section._open"
              [class.max-h-0]="!section._open"
              [class.opacity-0]="!section._open">
              <div *ngFor="let item of section.children">
                <a
                  *ngIf="item.type === 'item' && isValidRoute(item.route) && (!item.permission || authService.hasPermission(item.permission))"
                  [routerLink]="item.route"
                  routerLinkActive="bg-zinc-200/80 text-primary-600 font-black shadow-sm"
                  #rlaChild="routerLinkActive"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="relative flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-zinc-400 hover:bg-zinc-200/80 hover:shadow-sm transition-all">
                  <div *ngIf="rlaChild.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-600 rounded-r-full"></div>
                  <span class="truncate">{{ item.title }}</span>
                </a>
                
                <!-- Non-link child -->
                <div 
                  *ngIf="item.type === 'item' && !isValidRoute(item.route) && (!item.permission || authService.hasPermission(item.permission))"
                  class="flex h-10 items-center gap-2 px-4 text-[13px] font-bold text-zinc-300 cursor-default italic">
                  <span class="truncate">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Non-link top-level -->
          <div 
            *ngIf="section.type === 'item' && !isValidRoute(section.route)"
            class="flex h-12 items-center gap-3 px-4 text-sm font-bold text-zinc-300 cursor-default opacity-60 italic">
            <ng-icon 
              [name]="getIconName(section.icon)" 
              class="h-5 w-5 shrink-0 opacity-40"></ng-icon>
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
      if (route === '/admin/dashboard' || route === 'dashboard' || title === 'dashboard') {
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
