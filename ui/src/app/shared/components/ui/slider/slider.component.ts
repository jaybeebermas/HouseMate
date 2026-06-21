import {
  Component,
  Input,
  forwardRef,
  signal,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSliderModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() discrete: boolean = true;
  @Input() range: boolean = false;

  singleControl = new FormControl<number>(0);
  
  rangeForm = new FormGroup({
    start: new FormControl<number>(0),
    end: new FormControl<number>(100)
  });

  isDisabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit() {
    this.singleControl.valueChanges.subscribe(val => {
      if (!this.range) {
        this.onChange(val);
      }
    });

    this.rangeForm.valueChanges.subscribe(val => {
      if (this.range) {
        this.onChange({
          min: val.start !== undefined && val.start !== null ? val.start : this.min,
          max: val.end !== undefined && val.end !== null ? val.end : this.max
        });
      }
    });
  }

  // ControlValueAccessor Implementation
  writeValue(value: any): void {
    if (this.range) {
      if (value && typeof value === 'object' && 'min' in value && 'max' in value) {
        this.rangeForm.setValue({
          start: value.min,
          end: value.max
        }, { emitEvent: false });
      } else {
        this.rangeForm.setValue({
          start: this.min,
          end: this.max
        }, { emitEvent: false });
      }
    } else {
      const numVal = typeof value === 'number' ? value : Number(value || 0);
      this.singleControl.setValue(numVal, { emitEvent: false });
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
      this.singleControl.disable({ emitEvent: false });
      this.rangeForm.disable({ emitEvent: false });
    } else {
      this.singleControl.enable({ emitEvent: false });
      this.rangeForm.enable({ emitEvent: false });
    }
  }
}
