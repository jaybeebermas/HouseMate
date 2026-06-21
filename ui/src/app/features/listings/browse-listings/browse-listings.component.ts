import { Component, OnInit, inject, signal, computed, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GraphqlService } from '../../../services/graphql/graphql.service';
import { ToastService } from '../../../services/toast/toast.service';
import { AuthService } from '../../../services/auth/auth.service';
import { SearchOverlayComponent } from '../../../shared/components/ui/search-overlay/search-overlay.component';
import { FooterComponent } from '../../../shared/components/layout/footer/footer.component';

interface PaginatedListingsResponse {
  paginatedListings: {
    data: any[];
    total: number;
    hasMore: boolean;
  };
}

@Component({
  selector: 'app-browse-listings',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchOverlayComponent, FooterComponent],
  templateUrl: './browse-listings.component.html',
  styleUrl: './browse-listings.component.css'
})
export class BrowseListingsComponent implements OnInit {
  private readonly graphqlService = inject(GraphqlService);
  private readonly toastService = inject(ToastService);
  public readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  onUnderDevelopment(event: Event, featureName: string): void {
    event.preventDefault();
    this.toastService.show(`${featureName} is currently under development.`, 'info', 'Coming Soon');
  }

  // Global Header Navbar controls
  public readonly showDropdown = signal(false);
  public readonly showSearch = signal(typeof localStorage !== 'undefined' ? localStorage.getItem('search_overlay_open') === 'true' : false);

  get currentUser(): any {
    return this.authService.currentUser();
  }

  goToLogin(signup: boolean = false): void {
    if (signup) {
      this.router.navigate(['/login'], { queryParams: { mode: 'signup' } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown.update(v => !v);
  }

  openSearchOverlay(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showSearch.set(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('search_overlay_open', 'true');
    }
  }

  closeSearchOverlay(): void {
    this.showSearch.set(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('search_overlay_open', 'false');
    }
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.showDropdown.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  onPostRoom(): void {
    this.router.navigate(['/landlord/post']);
  }

  // Filter Signals
  public readonly searchQuery = signal('');
  public readonly tempSearchQuery = signal(''); // for input typing
  public readonly activeCategory = signal('');
  public readonly minPrice = signal<number | null>(null);
  public readonly maxPrice = signal<number | null>(null);
  public readonly sortBy = signal('newest');

  // Pagination Signals
  public readonly page = signal(1);
  public readonly limit = 8;
  public readonly totalListings = signal(0);
  public readonly hasMore = signal(false);
  public readonly isLoading = signal(false);

  // Data
  public readonly listings = signal<any[]>([]);

  // Computed page calculations
  public readonly totalPages = computed(() => {
    const total = this.totalListings();
    return total > 0 ? Math.ceil(total / this.limit) : 1;
  });

  private readonly getPaginatedListingsQuery = `
    query GetPaginatedListings(
      $search: String
      $category: String
      $min_price: Float
      $max_price: Float
      $sort_by: String
      $page: Int
      $limit: Int
    ) {
      paginatedListings(
        search: $search
        category: $category
        min_price: $min_price
        max_price: $max_price
        sort_by: $sort_by
        page: $page
        limit: $limit
      ) {
        data {
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
          }
        }
        total
        hasMore
      }
    }
  `;

  ngOnInit(): void {
    this.loadListings();
  }

  async loadListings(): Promise<void> {
    this.isLoading.set(true);
    this.cdr.detectChanges();

    try {
      const variables = {
        search: this.searchQuery() || null,
        category: this.activeCategory() || null,
        min_price: this.minPrice(),
        max_price: this.maxPrice(),
        sort_by: this.sortBy(),
        page: this.page(),
        limit: this.limit
      };

      const response = await this.graphqlService.request<PaginatedListingsResponse>(
        this.getPaginatedListingsQuery,
        variables
      );

      if (response && response.paginatedListings) {
        const pag = response.paginatedListings;
        this.totalListings.set(pag.total);
        this.hasMore.set(pag.hasMore);

        const mapped = pag.data.map((l: any) => ({
          id: l.id,
          title: this.getListingTitle(l),
          location: this.getShortAddress(l.address),
          price: `₱${parseFloat(l.price).toLocaleString()}/mo`,
          rating: l.rating ?? 5.0,
          reviewsCount: l.reviews_count ?? 0,
          coverUrl: l.cover_image || (l.images && l.images[0]) || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
          landlordName: l.user ? `${l.user.first_name} ${l.user.last_name}` : 'Unknown Landlord',
          landlordAvatar: l.user?.avatar || null,
          landlordFirstName: l.user?.first_name || '',
          landlordLastName: l.user?.last_name || '',
          badge: this.getListingBadge(l.price, l.id)
        }));

        this.listings.set(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load listings:', err);
      this.toastService.show(err.message || 'Could not retrieve listings.', 'error', 'Data Load Error');
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  // Action Handlers
  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempSearchQuery.set(val);
  }

  submitSearch(event: Event): void {
    event.preventDefault();
    this.searchQuery.set(this.tempSearchQuery());
    this.page.set(1);
    this.loadListings();
  }

  clearSearch(): void {
    this.tempSearchQuery.set('');
    this.searchQuery.set('');
    this.page.set(1);
    this.loadListings();
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
    this.page.set(1);
    this.loadListings();
  }

  onPriceChange(type: 'min' | 'max', event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const parsed = val ? parseFloat(val) : null;
    if (type === 'min') {
      this.minPrice.set(parsed);
    } else {
      this.maxPrice.set(parsed);
    }
    this.page.set(1);
    this.loadListings();
  }

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.sortBy.set(val);
    this.page.set(1);
    this.loadListings();
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) {
      this.page.set(p);
      this.loadListings();
      // Scroll to top of listings
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.page();

    // Return simple numbered list
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Helpers
  getInitials(firstName: string, lastName: string): string {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return f + l;
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

  getListingTitle(listing: any): string {
    if (!listing.details) return `${this.getCategoryLabel(listing.category)} for Rent`;
    const stripped = listing.details.replace(/<[^>]*>/g, '').trim();
    if (stripped.length > 10) {
      return stripped.substring(0, 50) + (stripped.length > 50 ? '...' : '');
    }
    return `${this.getCategoryLabel(listing.category)} for Rent`;
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

  getListingBadge(price: number, id: any): string {
    const idNum = parseInt(id) || 1;
    if (price < 8000) return 'Budget Friendly';
    if (price >= 15000) return 'Premium';
    const badges = ['Verified', 'Highly Rated', 'Popular', 'New Listing'];
    return badges[idNum % badges.length];
  }
}
