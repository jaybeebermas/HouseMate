import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { SwitchComponent } from '../switch/switch.component';
import { SliderComponent } from '../slider/slider.component';
import { ChipsComponent } from '../chips/chips.component';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerComponent,
    DateRangePickerComponent,
    AutocompleteComponent,
    SwitchComponent,
    SliderComponent,
    ChipsComponent
  ],
  templateUrl: './showcase.component.html',
  styles: [`
    :host {
      display: block;
      min-h-screen: 100vh;
    }
  `]
})
export class ShowcaseComponent implements OnInit {
  showcaseForm!: FormGroup;
  isFormDisabled = false;
  autocompleteLoading = false;

  // Mock locations for Autocomplete search
  locations = [
    { name: 'Manila, Philippines', value: 'manila' },
    { name: 'Quezon City, Metro Manila', value: 'quezon_city' },
    { name: 'Cebu City, Visayas', value: 'cebu' },
    { name: 'Davao City, Mindanao', value: 'davao' },
    { name: 'Cagayan de Oro, Mindanao', value: 'cdo' },
    { name: 'Bacolod City, Negros Occidental', value: 'bacolod' },
    { name: 'Iloilo City, Panay Island', value: 'iloilo' }
  ];
  filteredLocations: any[] = [];

  constructor(private fb: FormBuilder) {
    this.filteredLocations = [...this.locations];
  }

  ngOnInit() {
    this.showcaseForm = this.fb.group({
      datePicker: [new Date()],
      dateRangePicker: [{
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }],
      autocomplete: ['quezon_city'],
      switch: [true],
      slider: [45],
      rangeSlider: [{ min: 2000, max: 8000 }],
      chips: [['Wifi', 'Air Conditioning', 'Pet Friendly']]
    });
  }

  toggleDisabled() {
    this.isFormDisabled = !this.isFormDisabled;
    if (this.isFormDisabled) {
      this.showcaseForm.disable();
    } else {
      this.showcaseForm.enable();
    }
  }

  onQueryChange(query: string) {
    this.autocompleteLoading = true;
    // Simulate server side search delay
    setTimeout(() => {
      if (!query) {
        this.filteredLocations = [...this.locations];
      } else {
        const lower = query.toLowerCase();
        this.filteredLocations = this.locations.filter(loc => 
          loc.name.toLowerCase().includes(lower)
        );
      }
      this.autocompleteLoading = false;
    }, 400);
  }

  resetForm() {
    this.showcaseForm.reset({
      datePicker: new Date(),
      dateRangePicker: { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      autocomplete: 'manila',
      switch: false,
      slider: 50,
      rangeSlider: { min: 3000, max: 7000 },
      chips: [['Co-working space']]
    });
  }
}
