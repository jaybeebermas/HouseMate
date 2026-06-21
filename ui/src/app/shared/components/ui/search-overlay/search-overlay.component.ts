import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchResult {
  title: string;
  category: string;
  price?: string;
  location?: string;
  url: string;
}

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.css'
})
export class SearchOverlayComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  searchResults: SearchResult[] = [];

  // Mock database for the modern search experience
  public readonly mockDatabase: SearchResult[] = [
    { title: 'Premium Loft near De La Salle University', category: 'Rooms', price: '₱8,500/mo', location: 'Malate, Manila', url: '#' },
    { title: 'Modern Studio in Bonifacio Global City', category: 'Rooms', price: '₱18,000/mo', location: 'Taguig, Metro Manila', url: '#' },
    { title: 'Cozy Shared Apartment near Ateneo', category: 'Rooms', price: '₱6,500/mo', location: 'Katipunan, Quezon City', url: '#' },
    { title: 'Spacious Studio Room in Cebu IT Park', category: 'Rooms', price: '₱9,500/mo', location: 'Lahug, Cebu City', url: '#' },
    { title: 'Pet Friendly Shared Condo', category: 'Rooms', price: '₱7,500/mo', location: 'Makati, Metro Manila', url: '#' },
    { title: 'How to Split Utility Bills Without Ruining Friendships', category: 'Articles', url: '#' },
    { title: '5 Red Flags to Watch Out For in a Roommate Agreement', category: 'Articles', url: '#' },
    { title: 'Moving to Manila: A Student\'s Complete Housing Guide', category: 'Articles', url: '#' },
    { title: 'Barangay Health and Safety Guidelines for Boarding Houses', category: 'Articles', url: '#' },
    { title: 'Maria Santos (DLSU Area Landlord)', category: 'Landlords', url: '#' },
    { title: 'John Doe (BGC Verified Host)', category: 'Landlords', url: '#' },
    { title: 'Elena Ramos (Ateneo Area Landlord)', category: 'Landlords', url: '#' }
  ];

  public readonly popularSearches = [
    'Pet Friendly',
    'Solo Bathroom',
    'Under ₱8,000',
    'Loft near DLSU',
    'Studio in BGC'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        if (typeof document !== 'undefined') {
          document.body.classList.add('overflow-hidden');
        }
        this.searchQuery = '';
        this.searchResults = [];
        setTimeout(() => {
          this.searchInputRef?.nativeElement?.focus();
        }, 100);
      } else {
        if (typeof document !== 'undefined') {
          document.body.classList.remove('overflow-hidden');
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onSearchChange(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.mockDatabase.filter(item => 
      item.title.toLowerCase().includes(query) ||
      (item.location && item.location.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query)
    );
  }

  selectPopular(search: string): void {
    this.searchQuery = search;
    this.onSearchChange();
  }

  onClose(): void {
    this.close.emit();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.searchInputRef?.nativeElement?.focus();
  }
}
