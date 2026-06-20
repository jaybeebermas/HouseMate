import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  template: `
    <div class="bg-zinc-50/50 border-t border-zinc-100 rounded-b-2xl px-6">
      <mat-paginator
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageIndex]="currentPage - 1"
        [pageSizeOptions]="[5, 10, 25, 100]"
        (page)="handlePageEvent($event)"
        aria-label="Select page">
      </mat-paginator>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-paginator {
      background: transparent !important;
      font-family: inherit;
      font-size: 11px !important;
    }
    :host ::ng-deep .mat-mdc-paginator-container {
      padding: 0.5rem 0 !important;
      justify-content: space-between;
      min-height: 48px !important;
    }
    :host ::ng-deep .mat-mdc-paginator-range-label {
      display: none !important;
    }
    :host ::ng-deep .mat-mdc-icon-button {
      width: 32px !important;
      height: 32px !important;
      padding: 4px !important;
    }
  `]
})
export class TablePaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  handlePageEvent(e: PageEvent) {
    if (e.pageSize !== this.pageSize) {
      this.pageSizeChange.emit(e.pageSize);
    }
    this.pageChange.emit(e.pageIndex + 1);
  }
}
