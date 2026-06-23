import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div
      class="bg-white transition-transform duration-200 ease-out flex flex-col h-full z-[100] 
              fixed inset-0 md:relative md:inset-auto md:z-[60] md:border-l md:border-slate-200/80 shadow-2xl md:shadow-lg md:shadow-slate-900/10 will-change-transform"
      [class.translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen"
      [class.md:translate-x-0]="true"
      [class.w-full]="isOpen"
      [class.md:w-[450px]]="isOpen"
      [class.md:w-0]="!isOpen"
      [class.opacity-0]="!isOpen"
      [class.opacity-100]="isOpen"
      [class.md:opacity-100]="true"
    >
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 min-w-0 md:min-w-[450px]">
        <h2 class="text-lg sm:text-xl font-bold text-[#18305E] truncate tracking-tight">{{ title }}</h2>
        <button (click)="onClose()" class="group p-1.5 sm:p-2 hover:bg-red-50 rounded-xl transition-all active:scale-90">
          <ng-icon name="heroXMark" class="h-5 w-5 text-[#727272] group-hover:text-red-500 transition-colors" strokeWidth="2.5"></ng-icon>
        </button>
      </div>
 
      <!-- Body -->
      <div class="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-6 min-w-0 md:min-w-[450px]">
        <ng-content></ng-content>
      </div>
 
      <!-- Footer -->
      <div *ngIf="showFooter" class="p-4 sm:p-6 border-t border-slate-100 bg-white shrink-0 min-w-0 md:min-w-[450px]">
        <ng-content select="[drawerFooter]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class DrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
