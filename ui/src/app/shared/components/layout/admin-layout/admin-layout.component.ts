import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, CdkScrollable],
  template: `
    <div class="flex h-dvh w-full overflow-hidden bg-gradient-to-br from-slate-50 to-zinc-100 text-[#18305E] relative max-w-full">
      <!-- Mobile Backdrop — closes sidebar on tap -->
      <div 
        *ngIf="sidebarOpen" 
        (click)="closeSidebar.emit()"
        class="fixed inset-0 z-[45] bg-[#18305E]/40 backdrop-blur-sm lg:hidden transition-all duration-300 animate-in fade-in">
      </div>

      <app-sidebar 
        [isOpen]="sidebarOpen" 
        [navItems]="navItems"
        (closeSidebar)="closeSidebar.emit()">
      </app-sidebar>

      <!-- Main Content Area -->
      <div class="flex flex-1 flex-col overflow-hidden relative min-w-0 max-w-full transition-all duration-300"
           [class.lg:ml-0]="true">
        <app-header
          (toggleSidebar)="toggleSidebar.emit()">
        </app-header>

        <main cdkScrollable class="flex-1 overflow-y-auto scroll-smooth">
          <div class="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in-up min-h-full">
            <ng-content></ng-content>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  @Input() sidebarOpen = true;
  @Input() navItems: any[] = [];
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
}
