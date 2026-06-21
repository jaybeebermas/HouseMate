import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Type to search...';
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'name';
  @Input() optionValue: string = 'value';
  @Input() loading: boolean = false;

  @Output() queryChange = new EventEmitter<string>();

  internalControl = new FormControl<any>('');
  isDisabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit() {
    // Emit search query on type with a debounce
    this.internalControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(val => {
        const query = typeof val === 'string' ? val : this.getOptionLabel(val);
        this.queryChange.emit(query);

        // If an option was selected, propagate its value
        const matchedVal = this.getOptionValue(val);
        this.onChange(matchedVal);
      });
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

  onOptionSelected(event: any) {
    const selectedOption = event.option.value;
    const value = this.getOptionValue(selectedOption);
    this.onChange(value);
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
