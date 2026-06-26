import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavigationService, AuthService, UIConfigService, ToastService, ModalService, LoadingService } from './services';
import { NgIconComponent } from '@ng-icons/core';
import { NavigationItem } from './shared/models';
import { AdminLayoutComponent } from './shared/components/layout/admin-layout/admin-layout.component';
import { ModalComponent } from './shared/components/ui/modal/modal.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AiHelperComponent } from './shared/components/ui/ai-helper/ai-helper.component';
import { filter } from 'rxjs';

type NavNode = Omit<NavigationItem, 'children'> & {
  children: NavNode[];
  _open: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminLayoutComponent, NgIconComponent, ModalComponent, DashboardComponent, AiHelperComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ui');

  navigation = signal<NavNode[]>([]);
  loadingNavigation = signal(false);
  navigationError = signal('');
  sidebarOpen = signal(true);

  private readonly navigationService = inject(NavigationService);
  public readonly authService = inject(AuthService);
  public readonly toastService = inject(ToastService);
  public readonly modalService = inject(ModalService);
  public readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly uiConfig = inject(UIConfigService);

  isSubRoute(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  isGuestUser(): boolean {
    return this.authService.currentUser()?.role === 'guest';
  }

  isLandingPage(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/' || url === '/landing';
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkScreenSize();
      window.addEventListener('resize', () => this.checkScreenSize());
    }

    // Set document title based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url: string = event.urlAfterRedirects || event.url || '';
      if (url.startsWith('/admin') || url.startsWith('/settings')) {
        document.title = 'HouseMate Admin';
      } else if (url === '/' || url.startsWith('/landing')) {
        document.title = 'HouseMate';
      }
    });

    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      this.loadNavigation();
    });
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile && this.sidebarOpen()) {
        this.sidebarOpen.set(false);
      }
    }
  }

  async ngOnInit(): Promise<void> {}

  private async loadNavigation(): Promise<void> {
    this.loadingNavigation.set(true);
    this.navigationError.set('');
    try {
      const raw = await this.navigationService.getNavigation();
      this.navigation.set(this.stampOpen(raw));
    } catch (error: unknown) {
      this.navigationError.set(
        error instanceof Error ? error.message : 'Failed to load navigation.'
      );
    } finally {
      this.loadingNavigation.set(false);
    }
  }

  private stampOpen(items: NavigationItem[]): NavNode[] {
    return items.map(item => ({
      ...item,
      _open: false,
      children: item.children?.length ? this.stampOpen(item.children) : [],
    }));
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleSection(section: NavNode): void {
    section._open = !section._open;
    this.navigation.update(nav => [...nav]);
  }
}
