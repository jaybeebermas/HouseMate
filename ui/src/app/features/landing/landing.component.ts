import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly featuredListings = [
    {
      title: 'Premium Loft near De La Salle University',
      location: 'Malate, Manila',
      price: '₱8,500/mo',
      rating: 4.8,
      reviewsCount: 24,
      coverUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
      landlordName: 'Maria Santos',
      landlordAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
      badge: 'Highly Rated'
    },
    {
      title: 'Modern Studio in Bonifacio Global City',
      location: 'Taguig, Metro Manila',
      price: '₱18,000/mo',
      rating: 4.9,
      reviewsCount: 16,
      coverUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
      landlordName: 'John Doe',
      landlordAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
      badge: 'Verified'
    },
    {
      title: 'Cozy Shared Apartment near Ateneo',
      location: 'Katipunan, Quezon City',
      price: '₱6,500/mo',
      rating: 4.7,
      reviewsCount: 32,
      coverUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
      landlordName: 'Elena Ramos',
      landlordAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
      badge: 'Popular'
    },
    {
      title: 'Spacious Studio Room in Cebu IT Park',
      location: 'Lahug, Cebu City',
      price: '₱9,500/mo',
      rating: 4.6,
      reviewsCount: 11,
      coverUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80',
      landlordName: 'Carlos Mangubat',
      landlordAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
      badge: 'New Listing'
    }
  ];

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

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}

