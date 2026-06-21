import { Component, ElementRef, ViewChild, inject, signal, computed, AfterViewInit, NgZone } from '@angular/core';
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
  showLandmarks = signal(false);
  landmarkSearchQuery = signal('');
  autocompleteQuery = signal('');
  
  landmarks = [
    { name: 'UST (University of Santo Tomas), Sampaloc, Manila', lat: 14.6098, lng: 120.9896 },
    { name: 'DLSU (De La Salle University), Taft Ave, Manila', lat: 14.5648, lng: 120.9932 },
    { name: 'UP Diliman, Quezon City', lat: 14.6537, lng: 121.0685 },
    { name: 'Ateneo de Manila University, Katipunan, Quezon City', lat: 14.6396, lng: 121.0778 },
    { name: 'FEU (Far Eastern University), Sampaloc, Manila', lat: 14.6042, lng: 120.9873 },
    { name: 'Mapua University, Intramuros, Manila', lat: 14.5905, lng: 120.9781 },
    { name: 'PUP (Polytechnic University of the Philippines), Sta. Mesa, Manila', lat: 14.5979, lng: 121.0109 },
    { name: 'National University, Sampaloc, Manila', lat: 14.6045, lng: 120.9946 },
    { name: 'U-Belt (University Belt), Recto Ave, Manila', lat: 14.6019, lng: 120.9892 },
    { name: 'Taft Avenue, Malate, Manila', lat: 14.5701, lng: 120.9918 }
  ];

  filteredLandmarks = computed(() => {
    const query = this.landmarkSearchQuery().toLowerCase().trim();
    if (!query) return this.landmarks;
    return this.landmarks.filter(l => l.name.toLowerCase().includes(query));
  });

  filteredLandmarksForAutocomplete = computed(() => {
    const query = this.autocompleteQuery().toLowerCase().trim();
    if (!query) return this.landmarks;
    return this.landmarks.filter(l => l.name.toLowerCase().includes(query));
  });

  // Google Map objects
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

    // Automatically update coordinates and center map if address matches a predefined landmark
    this.postForm.get('address')?.valueChanges.subscribe(val => {
      if (val) {
        const match = this.landmarks.find(l => l.name === val);
        if (match) {
          this.postForm.patchValue({
            latitude: match.lat,
            longitude: match.lng
          }, { emitEvent: false }); // avoid infinite loops
          
          if (this.map && this.marker) {
            const latLng = { lat: match.lat, lng: match.lng };
            this.map.setCenter(latLng);
            this.map.setZoom(16);
            this.marker.setPosition(latLng);
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadGoogleMapsScript()
      .then(() => {
        this.initMap();
      })
      .catch((err) => {
        console.error('Google Maps API failed to load:', err);
        this.toastService.show('Unable to load interactive maps.', 'error', 'Maps Load Error');
      });
  }

  // Load Google Maps API script dynamically
  private loadGoogleMapsScript(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  // Initialize Map
  private initMap(): void {
    const lat = this.postForm.get('latitude')?.value || 14.5995;
    const lng = this.postForm.get('longitude')?.value || 120.9842;
    const centerPoint = { lat, lng };

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: centerPoint,
      zoom: 13,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "poi",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "transit",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    });

    this.marker = new google.maps.Marker({
      position: centerPoint,
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    // Handle pin drag coordinates update
    this.marker.addListener('dragend', () => {
      this.ngZone.run(() => {
        const position = this.marker.getPosition();
        this.updateCoordinates(position.lat(), position.lng());
        this.reverseGeocode(position.lat(), position.lng());
      });
    });

    // Handle map click to drop pin
    this.map.addListener('click', (event: any) => {
      this.ngZone.run(() => {
        const latLng = event.latLng;
        this.marker.setPosition(latLng);
        this.updateCoordinates(latLng.lat(), latLng.lng());
        this.reverseGeocode(latLng.lat(), latLng.lng());
      });
    });
  }

  // Reverse Geocoding via coordinates
  private reverseGeocode(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results[0]) {
          this.postForm.patchValue({
            address: results[0].formatted_address
          });
        }
      });
    });
  }

  private updateCoordinates(lat: number, lng: number): void {
    this.postForm.patchValue({
      latitude: parseFloat(lat.toFixed(8)),
      longitude: parseFloat(lng.toFixed(8))
    });
  }

  onAutocompleteQueryChange(query: string): void {
    this.autocompleteQuery.set(query);
  }

  // Address search manual input changes
  onAddressInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.landmarkSearchQuery.set(value);
    this.showLandmarks.set(true);
    this.postForm.patchValue({ address: value });
  }

  hideLandmarksWithDelay(): void {
    setTimeout(() => {
      this.showLandmarks.set(false);
    }, 250);
  }

  selectLandmark(landmark: { name: string, lat: number, lng: number }): void {
    this.postForm.patchValue({
      address: landmark.name,
      latitude: landmark.lat,
      longitude: landmark.lng
    });
    this.landmarkSearchQuery.set('');
    this.showLandmarks.set(false);

    if (this.map && this.marker) {
      const latLng = { lat: landmark.lat, lng: landmark.lng };
      this.map.setCenter(latLng);
      this.map.setZoom(16);
      this.marker.setPosition(latLng);
    }
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
            const latLng = { lat, lng };

            if (this.map && this.marker) {
              this.map.setCenter(latLng);
              this.map.setZoom(16);
              this.marker.setPosition(latLng);
            }
            
            this.updateCoordinates(lat, lng);
            this.reverseGeocode(lat, lng);
            this.toastService.show('Current location Pinpointed!', 'success', 'Location Detected');
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
