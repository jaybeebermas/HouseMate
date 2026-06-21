import { Component, OnInit, ElementRef, ViewChild, inject, signal, ChangeDetectorRef, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { GraphqlService } from '../../../services/graphql/graphql.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-details.component.html',
  styleUrl: './listing-details.component.css'
})
export class ListingDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly graphqlService = inject(GraphqlService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  @ViewChild('mapContainer') mapElement!: ElementRef;

  private map: any;
  private slideIntervalId: any = null;
  listingId: string | null = null;
  listing = signal<any>(null);
  isLoading = signal(true);
  activeImageIndex = signal(0);

  private readonly getListingQuery = `
    query GetListing($id: ID!) {
      listing(id: $id) {
        id
        category
        price
        details
        latitude
        longitude
        address
        images
        cover_image
        rating
        reviews_count
        created_at
        user {
          id
          first_name
          last_name
          email
          avatar
          phone_number
        }
      }
    }
  `;

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.listingId = this.route.snapshot.paramMap.get('id');
    if (!this.listingId) {
      this.toastService.show('Invalid listing ID.', 'error', 'Error');
      this.router.navigate(['/']);
      return;
    }

    this.loadListingDetails();
  }

  ngAfterViewInit(): void {
    // Leaflet map will be initialized after listing details have been loaded
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private loadLeaflet(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).L) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const existingScript = document.querySelector('script[src*="leaflet.js"]');
      if (existingScript) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).L) {
            clearInterval(interval);
            resolve();
          } else if (attempts > 100) {
            clearInterval(interval);
            reject(new Error('Leaflet script failed to initialize.'));
          }
        }, 50);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  async loadListingDetails(): Promise<void> {
    try {
      this.isLoading.set(true);
      const response = await this.graphqlService.request<{ listing: any }>(this.getListingQuery, {
        id: this.listingId
      });

      if (response && response.listing) {
        this.listing.set(response.listing);
        this.isLoading.set(false);
        this.cdr.detectChanges();
        this.resumeAutoSlide();

        // Load Leaflet and then initialize map
        this.loadLeaflet()
          .then(() => {
            setTimeout(() => {
              this.initLeafletMap();
            }, 100);
          })
          .catch((err) => {
            console.error('Failed to load Leaflet:', err);
          });
      } else {
        this.toastService.show('Listing not found.', 'error', 'Error');
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      console.error('Error fetching listing details:', err);
      this.toastService.show(err.message || 'Could not retrieve listing details.', 'error', 'Load Error');
      this.router.navigate(['/']);
    }
  }

  private initLeafletMap(): void {
    const listData = this.listing();
    if (!listData || !this.mapElement) return;

    this.ngZone.runOutsideAngular(() => {
      const L = (window as any).L;
      if (!L) {
        console.warn('Leaflet (L) is not loaded.');
        return;
      }

      const lat = listData.latitude || 14.5995;
      const lng = listData.longitude || 120.9842;
      const centerPoint = [lat, lng];

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map(this.mapElement.nativeElement, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView(centerPoint, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Custom modern marker with brand primary color (navy/teal)
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#18305E] border-2 border-white shadow-lg text-white animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.302.054c.122 0 .244-.03.354-.088l.026-.013c.047-.025.11-.06.186-.105.15-.09.386-.24.673-.467.574-.456 1.399-1.159 2.206-1.996C17.788 17.65 20 14.61 20 11.5a8 8 0 10-16 0c0 3.11 2.212 6.15 4.606 8.599a31.03 31.03 0 003.02 2.651c.287.228.522.376.674.467a1.956 1.956 0 00.187.106.377.377 0 00.046.023zM12 14a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      L.marker(centerPoint, { icon: customIcon }).addTo(this.map);

      // Force Leaflet to recalculate container size once layout has finished rendering
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);
    });
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      room: 'Private Room',
      apartment: 'Apartment',
      bedspace: 'Cozy Bedspace',
      house: 'House for Rent'
    };
    return labels[category] || category;
  }

  getInitials(firstName: string, lastName: string): string {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return f + l;
  }

  getShortAddress(address: string): string {
    if (!address) return '';
    const parts = address.split(',');
    if (parts.length <= 2) {
      return address;
    }
    if (parts.length >= 5) {
      const city = parts[parts.length - 5].trim();
      const state = parts[parts.length - 3].trim();
      return `${city}, ${state}`;
    }
    const first = parts[0].trim();
    const last = parts[parts.length - 3]?.trim() || parts[parts.length - 2]?.trim() || '';
    return `${first}, ${last}`;
  }

  getAllImages(): string[] {
    const listData = this.listing();
    if (!listData) return [];
    
    const list: string[] = [];
    if (listData.cover_image) {
      list.push(listData.cover_image);
    }
    if (listData.images && Array.isArray(listData.images)) {
      listData.images.forEach((img: string) => {
        if (img && img !== listData.cover_image) {
          list.push(img);
        }
      });
    }

    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80');
    }
    return list;
  }

  setActiveImage(index: number): void {
    this.activeImageIndex.set(index);
    this.resumeAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.slideIntervalId = setInterval(() => {
      this.nextImage();
      this.cdr.detectChanges();
    }, 4000);
  }

  stopAutoSlide(): void {
    if (this.slideIntervalId) {
      clearInterval(this.slideIntervalId);
      this.slideIntervalId = null;
    }
  }

  pauseAutoSlide(): void {
    this.stopAutoSlide();
  }

  resumeAutoSlide(): void {
    const images = this.getAllImages();
    if (images.length > 1) {
      this.startAutoSlide();
    }
  }

  nextImage(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const images = this.getAllImages();
    if (images.length <= 1) return;
    this.activeImageIndex.update(idx => (idx + 1) % images.length);
  }

  prevImage(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const images = this.getAllImages();
    if (images.length <= 1) return;
    this.activeImageIndex.update(idx => (idx - 1 + images.length) % images.length);
  }
}
