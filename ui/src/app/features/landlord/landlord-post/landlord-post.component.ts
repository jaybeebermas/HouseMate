import { Component, ElementRef, ViewChild, inject, signal, computed, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { SelectComponent } from '../../../shared/components/ui/select/select.component';
import { AutocompleteComponent } from '../../../shared/components/ui/autocomplete/autocomplete.component';

declare var google: any;

interface UploadedImage {
  name: string;
  url: string; // Base64 data URL for preview & storage
}

@Component({
  selector: 'app-landlord-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SelectComponent, AutocompleteComponent],
  templateUrl: './landlord-post.component.html',
  styleUrl: './landlord-post.component.css'
})
export class LandlordPostComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('mapContainer') mapElement!: ElementRef;
  @ViewChild('editorArea') editorArea!: ElementRef;

  postForm: FormGroup;
  isLoading = signal(false);
  isSubmitted = signal(false);

  // Gallery state
  uploadedImages = signal<UploadedImage[]>([]);
  coverImageName = signal<string | null>(null);
  isDragging = signal(false);

  // Category wrapper configuration
  categoryOptions = [
    { name: 'Private Room', value: 'room' },
    { name: 'Apartment', value: 'apartment' },
    { name: 'Bedspace', value: 'bedspace' },
    { name: 'House for Rent', value: 'house' }
  ];

  // Landmark Searchable Dropdown state
  autocompleteQuery = signal('');
  landmarks = signal<any[]>([]);

  filteredLandmarksForAutocomplete = computed(() => this.landmarks());

  // Leaflet Map objects
  private map: any;
  private marker: any;

  constructor() {
    this.postForm = this.fb.group({
      category: ['room', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1)]],
      details: ['', [Validators.required, Validators.minLength(20)]],
      address: ['', [Validators.required]],
      latitude: [14.5995, [Validators.required]],
      longitude: [120.9842, [Validators.required]]
    });

    // Automatically update coordinates and center map if address matches a fetched landmark
    this.postForm.get('address')?.valueChanges.subscribe(val => {
      if (val) {
        const match = this.landmarks().find(l => l.name === val);
        if (match) {
          this.postForm.patchValue({
            latitude: match.lat,
            longitude: match.lng
          }, { emitEvent: false }); // avoid infinite loops
          
          if (this.map && this.marker) {
            const latLng = [match.lat, match.lng];
            this.map.setView(latLng, 16);
            this.marker.setLatLng(latLng);
          }
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadLeaflet()
      .then(() => {
        this.initLeafletMap();
      })
      .catch((err) => {
        console.error('Leaflet failed to load:', err);
        this.toastService.show('Unable to load interactive maps.', 'error', 'Maps Load Error');
        this.showMapFallback();
      });
  }

  // Load Leaflet CSS and JS dynamically from CDN
  private loadLeaflet(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).L) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  private showMapFallback(): void {
    if (this.mapElement) {
      this.mapElement.nativeElement.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full bg-slate-50 border border-slate-200/80 p-6 text-center select-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-slate-400 mb-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8m-3-4h.008v.008H12V11.25zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs font-bold text-slate-700">Offline / Demo Mode</p>
          <p class="text-[10px] text-slate-500 mt-1 max-w-xs">Interactive maps are currently disabled. The default location coordinates will still be saved on submission.</p>
        </div>
      `;
    }
  }

  // Initialize Leaflet Map with OpenStreetMap
  private initLeafletMap(): void {
    const L = (window as any).L;
    const lat = this.postForm.get('latitude')?.value || 14.5995;
    const lng = this.postForm.get('longitude')?.value || 120.9842;
    const centerPoint = [lat, lng];

    this.map = L.map(this.mapElement.nativeElement).setView(centerPoint, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Custom modern marker with brand primary color teal
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 border-2 border-white shadow-lg text-white animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.302.054c.122 0 .244-.03.354-.088l.026-.013c.047-.025.11-.06.186-.105.15-.09.386-.24.673-.467.574-.456 1.399-1.159 2.206-1.996C17.788 17.65 20 14.61 20 11.5a8 8 0 10-16 0c0 3.11 2.212 6.15 4.606 8.599a31.03 31.03 0 003.02 2.651c.287.228.522.376.674.467a1.956 1.956 0 00.187.106.377.377 0 00.046.023zM12 14a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.marker = L.marker(centerPoint, {
      draggable: true,
      icon: customIcon
    }).addTo(this.map);

    // Handle pin drag coordinates update
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.ngZone.run(() => {
        this.updateCoordinates(position.lat, position.lng);
        this.reverseGeocode(position.lat, position.lng);
      });
    });

    // Handle map click to drop pin
    this.map.on('click', (event: any) => {
      const position = event.latlng;
      this.marker.setLatLng(position);
      this.ngZone.run(() => {
        this.updateCoordinates(position.lat, position.lng);
        this.reverseGeocode(position.lat, position.lng);
      });
    });

    // Handle initial reverse geocoding if address is empty
    if (!this.postForm.get('address')?.value) {
      this.reverseGeocode(lat, lng);
    }
  }

  // Reverse Geocoding via coordinates using OpenStreetMap Nominatim API
  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'HouseMate-CoLiving-App'
      }
    })
      .then(res => res.json())
      .then(data => {
        this.ngZone.run(() => {
          if (data && data.display_name) {
            this.postForm.patchValue({
              address: data.display_name
            });
            this.cdr.detectChanges();
          }
        });
      })
      .catch(err => {
        console.error('Reverse geocoding error:', err);
      });
  }

  private updateCoordinates(lat: number, lng: number): void {
    this.postForm.patchValue({
      latitude: parseFloat(lat.toFixed(8)),
      longitude: parseFloat(lng.toFixed(8))
    });
  }

  onAutocompleteQueryChange(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      this.landmarks.set([]);
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&countrycodes=ph`;
    fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'HouseMate-CoLiving-App'
      }
    })
      .then(res => res.json())
      .then(data => {
        this.ngZone.run(() => {
          if (Array.isArray(data)) {
            const results = data.map((item: any) => ({
              name: item.display_name,
              value: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }));
            this.landmarks.set(results);
            this.cdr.detectChanges();
          }
        });
      })
      .catch(err => {
        console.error('Nominatim API error:', err);
      });
  }

  // Use My Location Browser Geolocation API
  useMyLocation(event: Event): void {
    event.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.ngZone.run(() => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const latLng = [lat, lng];

            if (this.map && this.marker) {
              this.map.setView(latLng, 16);
              this.marker.setLatLng(latLng);
            }
            
            this.updateCoordinates(lat, lng);
            this.reverseGeocode(lat, lng);
            this.toastService.show('Current location Pinpointed!', 'success', 'Location Detected');
            this.cdr.detectChanges();
          });
        },
        (error) => {
          this.toastService.show('Unable to retrieve your geolocation details.', 'error', 'Location Error');
        }
      );
    } else {
      this.toastService.show('Geolocation is not supported by your browser.', 'error', 'Not Supported');
    }
  }

  // Custom Rich Text Editor Methods
  formatText(command: string, event: Event): void {
    event.preventDefault();
    document.execCommand(command, false, '');
    this.syncEditorContent();
  }

  syncEditorContent(): void {
    if (this.editorArea) {
      const content = this.editorArea.nativeElement.innerHTML;
      const textOnly = this.editorArea.nativeElement.textContent.trim();
      
      if (!textOnly) {
        this.postForm.patchValue({ details: '' });
      } else {
        this.postForm.patchValue({ details: content });
      }
      this.postForm.get('details')?.markAsTouched();
    }
  }

  // File drop/upload handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }

  private processFiles(files: FileList): void {
    const currentCount = this.uploadedImages().length;
    const remainingSlots = 5 - currentCount;

    if (remainingSlots <= 0) {
      this.toastService.show('You can only upload up to 5 images.', 'error', 'Limit Reached');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    filesToUpload.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        this.toastService.show(`${file.name} is not a supported format. Please upload JPG, PNG or WEBP.`, 'error', 'File Type Error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastService.show(`${file.name} is larger than 5MB limit.`, 'error', 'File Too Large');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.ngZone.run(() => {
          const newImg: UploadedImage = {
            name: file.name,
            url: e.target.result
          };

          this.uploadedImages.update(imgs => {
            const list = [...imgs, newImg];
            // Auto designate first image as cover
            if (!this.coverImageName()) {
              this.coverImageName.set(file.name);
            }
            return list;
          });
        });
      };
      reader.readAsDataURL(file);
    });
  }

  setCoverImage(name: string, event: Event): void {
    event.stopPropagation();
    this.coverImageName.set(name);
    this.toastService.show('Set as cover image.', 'info', 'Cover Photo Updated');
  }

  removeImage(index: number, event: Event): void {
    event.stopPropagation();
    const targetImage = this.uploadedImages()[index];
    this.uploadedImages.update(imgs => imgs.filter((_, i) => i !== index));

    // If we removed the cover, auto designate another one as cover
    if (this.coverImageName() === targetImage.name) {
      const remaining = this.uploadedImages();
      if (remaining.length > 0) {
        this.coverImageName.set(remaining[0].name);
      } else {
        this.coverImageName.set(null);
      }
    }
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    if (this.uploadedImages().length === 0) {
      this.toastService.show('Please upload at least 1 image of your room.', 'info', 'No Gallery Images');
      return;
    }

    this.isLoading.set(true);

    const formValues = this.postForm.value;
    const imagesList = this.uploadedImages().map(img => img.url);
    const coverUrl = this.uploadedImages().find(img => img.name === this.coverImageName())?.url || '';

    this.authService.createListing({
      category: formValues.category,
      price: parseFloat(formValues.price),
      details: formValues.details,
      latitude: formValues.latitude,
      longitude: formValues.longitude,
      address: formValues.address,
      images: imagesList,
      cover_image: coverUrl
    }).subscribe({
      next: (res) => {
        const data = res.data?.createListing;
        if (data && data.status === 'SUCCESS') {
          this.isSubmitted.set(true);
          this.toastService.show('Your listing is now live!', 'success', 'Listing Published');
        } else {
          this.toastService.show(data?.message || 'Failed to post listing.', 'error', 'Publish Failed');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.show(err.message || 'Error occurred while saving listing.', 'error', 'System Error');
        this.isLoading.set(false);
      }
    });
  }

  goBackHome(): void {
    this.router.navigate(['/']);
  }
}
