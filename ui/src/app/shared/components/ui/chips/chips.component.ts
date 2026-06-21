import {
  Component,
  Input,
  forwardRef,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-chips',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatChipsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipsComponent),
      multi: true
    }
  ],
  templateUrl: './chips.component.html',
  styleUrl: './chips.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Add tag...';
  @Input() removable: boolean = true;
  @Input() selectable: boolean = true;
  @Input() addOnBlur: boolean = true;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  
  tags = signal<string[]>([]);
  isDisabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.tags.update(tags => {
        const updated = [...tags, value];
        this.onChange(updated);
        return updated;
      });
    }

    event.chipInput!.clear();
  }

  remove(tag: string): void {
    if (this.isDisabled()) return;

    this.tags.update(tags => {
      const index = tags.indexOf(tag);
      if (index >= 0) {
        const updated = [...tags];
        updated.splice(index, 1);
        this.onChange(updated);
        return updated;
      }
      return tags;
    });
  }

  writeValue(value: any): void {
    if (Array.isArray(value)) {
      this.tags.set(value);
    } else {
      this.tags.set([]);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
