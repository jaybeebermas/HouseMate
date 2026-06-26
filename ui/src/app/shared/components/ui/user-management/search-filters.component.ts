import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, NgIconComponent],
  template: `
    <div class="flex flex-col md:flex-row gap-4 items-center">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 w-full form-field-std search-field">
        <mat-label>{{ placeholder }}</mat-label>
        <ng-icon name="heroMagnifyingGlass" matPrefix class="ml-3 mr-1 text-[#a1a1aa] text-lg"></ng-icon>
        <input
          matInput
          [(ngModel)]="searchTerm"
          (ngModelChange)="search.emit($event)"
        />
      </mat-form-field>
      <div class="flex gap-3 w-full md:w-auto items-center">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .search-field .mat-mdc-text-field-wrapper { height: 42px !important; }
    .search-field .mat-mdc-form-field-infix { padding-top: 8px !important; padding-bottom: 8px !important; min-height: unset !important; }
    .search-field .mdc-notched-outline__leading { border-radius: 10px 0 0 10px !important; }
    .search-field .mdc-notched-outline__trailing { border-radius: 0 10px 10px 0 !important; }
    .search-field .mdc-notched-outline__notch { border-right: none; }
    .search-field .mat-mdc-form-field-subscript-wrapper { display: none !important; }
  `]
})
export class SearchFiltersComponent {
  @Input() placeholder: string = 'Search...';
  @Output() search = new EventEmitter<string>();
  searchTerm: string = '';
}
