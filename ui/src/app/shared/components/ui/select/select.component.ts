import {
  Component,
  Input,
  forwardRef,
  signal,
  ChangeDetectionStrategy,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'name';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Select an option';
  @Input() iconName: string = ''; // Optional prefix icon

  internalControl = new FormControl<any>('');

  isDisabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit() {
    this.internalControl.valueChanges.subscribe(val => {
      const realValue = this.getOptionValue(val);
      this.onChange(realValue);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && !changes['options'].firstChange) {
      this.internalControl.setValue(this.internalControl.value);
    }
  }

  getOptionLabel = (option: any): string => {
    if (option === null || option === undefined) return '';
    if (typeof option === 'string' || typeof option === 'number') {
      const matched = this.options.find(opt => this.getOptionValue(opt) === option);
      if (matched) {
        return matched[this.optionLabel] !== undefined ? matched[this.optionLabel] : String(matched);
      }
      return String(option);
    }
    if (typeof option === 'object') {
      return option[this.optionLabel] !== undefined ? option[this.optionLabel] : String(option);
    }
    return String(option);
  };

  getOptionValue(option: any): any {
    if (typeof option === 'object' && option !== null) {
      return option[this.optionValue] !== undefined ? option[this.optionValue] : option;
    }
    return option;
  }

  togglePanel(event: Event, trigger: any) {
    event.stopPropagation();
    if (this.isDisabled()) return;
    
    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      trigger.openPanel();
    }
  }

  // ControlValueAccessor Implementation
  writeValue(value: any): void {
    const matched = this.options.find(opt => this.getOptionValue(opt) === value);
    this.internalControl.setValue(matched !== undefined ? matched : value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }
}
