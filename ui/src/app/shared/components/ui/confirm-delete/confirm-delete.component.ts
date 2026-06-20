import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './confirm-delete.component.html'
})
export class ConfirmDeleteComponent {
  @Input() name: string = '';
}
