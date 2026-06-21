import { Component, inject, signal, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { SearchOverlayComponent } from '../../shared/components/ui/search-overlay/search-overlay.component';
import { GraphqlService } from '../../services/graphql/graphql.service';
import { FooterComponent } from '../../shared/components/layout/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, SearchOverlayComponent, RouterLink, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly graphqlService = inject(GraphqlService);
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly showDropdown = signal(false);

  onUnderDevelopment(event: Event, featureName: string): void {
    event.preventDefault();
    this.toastService.show(`${featureName} is currently under development.`, 'info', 'Coming Soon');
  }

  onPostRoom(): void {
    this.router.navigate(['/landlord/post']);
  }
  public readonly showSearch = signal(typeof localStorage !== 'undefined' ? localStorage.getItem('search_overlay_open') === 'true' : false);

  public featuredListings: any[] = [];

  private readonly getListingsQuery = `
    query GetListings {
      listings {
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
    }
  `;

  ngOnInit(): void {
    this.loadListings();
  }

  async loadListings(): Promise<void> {
    try {
      const response = await this.graphqlService.request<{ listings: any[] }>(this.getListingsQuery);
      if (response && response.listings) {
        const mapped = response.listings.slice(0, 4).map((l: any) => ({
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
        this.featuredListings = mapped;
        this.cdr.detectChanges();
      }
    } catch (err: any) {
      console.error('Failed to load listings:', err);
      this.toastService.show(err.message || 'Could not retrieve listings.', 'error', 'Data Load Error');
    }
  }

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

  public readonly adviceArticles = [
    {
      title: 'How to Split Utility Bills Without Ruining Friendships',
      category: 'Utility Management',
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      author: 'HouseMate Editorial',
      summary: 'Practical templates and tools to manage and share electricity, water, and internet expenses fairly.'
    },
    {
      title: '5 Red Flags to Watch Out For in a Roommate Agreement',
      category: 'Co-Living Tips',
      readTime: '5 min read',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
      author: 'Atty. Sarah Jenkins',
      summary: 'Protect yourself and your deposit by avoiding these common contract pitfalls before moving in.'
    },
    {
      title: 'Moving to Manila: A Student\'s Complete Housing Guide',
      category: 'Relocation',
      readTime: '8 min read',
      imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=400&q=80',
      author: 'Mark Alcantara',
      summary: 'A neighborhood-by-neighborhood breakdown of safety, transportation, and average rent costs.'
    }
  ];

  get currentUser(): User | null {
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
}
