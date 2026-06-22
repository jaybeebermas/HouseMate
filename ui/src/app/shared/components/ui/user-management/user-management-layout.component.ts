import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full bg-transparent -m-4 md:-m-6 lg:-m-8 p-3 md:p-8 overflow-y-auto">
      <div class="w-full bg-white rounded-2xl border border-slate-200 p-4 md:p-8 shadow-sm flex flex-col gap-5 animate-fade-in-up min-h-[calc(100vh-10rem)]">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .shadow-inner-lg { box-shadow: inset 0 2px 15px 0 rgb(0 0 0 / 0.05); }
    @keyframes fadeInUp {
      from { opacity: 0; margin-top: 20px; }
      to { opacity: 1; margin-top: 0; }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class UserManagementLayoutComponent {}
