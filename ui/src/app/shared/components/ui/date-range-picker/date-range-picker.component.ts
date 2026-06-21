import {
  Component,
  Input,
  forwardRef,
  signal,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true
    }
  ],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangePickerComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() startPlaceholder: string = 'Start date';
  @Input() endPlaceholder: string = 'End date';
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;

  rangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });

  isDisabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit() {
    this.rangeForm.valueChanges.subscribe(val => {
      this.onChange({
        start: val.start || null,
        end: val.end || null
      });
    });
  }

  // ControlValueAccessor Implementation
  writeValue(value: any): void {
    if (value && (value.start || value.end)) {
      this.rangeForm.setValue({
        start: value.start ? new Date(value.start) : null,
        end: value.end ? new Date(value.end) : null
      }, { emitEvent: false });
    } else {
      this.rangeForm.setValue({ start: null, end: null }, { emitEvent: false });
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
    if (isDisabled) {
      this.rangeForm.disable({ emitEvent: false });
    } else {
      this.rangeForm.enable({ emitEvent: false });
    }
  }
}
