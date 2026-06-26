import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full bg-transparent -m-3 sm:-m-4 md:-m-6 lg:-m-8 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div class="w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm shadow-slate-900/5 flex flex-col gap-4 sm:gap-5 md:gap-6 animate-fade-in-up min-h-[calc(100vh-10rem)]">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class UserManagementLayoutComponent {}
