import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  permissions?: string[];
  phone_number?: string;
  valid_id?: string;
  landlord_status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.graphqlUrl;
  private readonly router = inject(Router);
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(!!localStorage.getItem('auth_token'));

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    if (user.role === 'super_admin' || user.role === 'superadmin') return true;
    if (user.role === 'admin') {
      return true;
    }
    return false;
  }

  constructor(private http: HttpClient) {
    this.checkAuth();
    // Monitor session expiration every 30 seconds
    setInterval(() => this.checkAuth(), 30000);
    this.setupActivityListeners();
  }

  private setupActivityListeners(): void {
    if (typeof window !== 'undefined') {
      let lastUpdate = Date.now();
      
      const updateActivity = () => {
        const now = Date.now();
        // Throttle localStorage updates to at most once every 5 seconds
        if (now - lastUpdate > 5000) {
          localStorage.setItem('auth_timestamp', now.toString());
          lastUpdate = now;
        }
      };

      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, updateActivity, { capture: true, passive: true });
      });
    }
  }

  login(username: string, password: string): Observable<any> {
    const query = `
      mutation Login($username: String!, $password: String!) {
        login(input: { username: $username, password: $password }) {
          status
          message
          token
          user {
            id
            username
            first_name
            last_name
            email
            role
            permissions
            landlord_status
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: { username, password }
    }).pipe(
      tap(response => {
        const data = response.data?.login;
        if (data && data.status === 'SUCCESS') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_timestamp', Date.now().toString());
          this.currentUser.set(data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  loginWithGoogle(token: string): Observable<any> {
    const query = `
      mutation LoginWithGoogle($token: String!) {
        loginWithGoogle(token: $token) {
          status
          message
          token
          user {
            id
            username
            first_name
            last_name
            email
            role
            permissions
            landlord_status
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: { token }
    }).pipe(
      tap(response => {
        const data = response.data?.loginWithGoogle;
        if (data && data.status === 'SUCCESS') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_timestamp', Date.now().toString());
          this.currentUser.set(data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  register(input: any): Observable<any> {
    const query = `
      mutation Register($username: String!, $first_name: String!, $last_name: String!, $email: String!, $password: String!) {
        register(input: { 
          username: $username, 
          first_name: $first_name, 
          last_name: $last_name, 
          email: $email, 
          password: $password 
        }) {
          status
          message
          token
          user {
            id
            username
            first_name
            last_name
            email
            role
            permissions
            landlord_status
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: input
    }).pipe(
      tap(response => {
        const data = response.data?.register;
        if (data && data.status === 'SUCCESS') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_timestamp', Date.now().toString());
          this.currentUser.set(data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  becomeLandlord(phoneNumber: string, validIdName: string): Observable<any> {
    const query = `
      mutation BecomeLandlord($phoneNumber: String!, $validIdName: String!) {
        becomeLandlord(input: { phone_number: $phoneNumber, valid_id_name: $validIdName }) {
          status
          message
            user {
            id
            username
            first_name
            last_name
            email
            role
            permissions
            phone_number
            valid_id
            landlord_status
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: { phoneNumber, validIdName }
    }).pipe(
      tap(response => {
        const data = response.data?.becomeLandlord;
        if (data && data.status === 'SUCCESS' && data.user) {
          this.currentUser.set(data.user);
        }
      })
    );
  }

  createListing(input: {
    category: string;
    price: number;
    details: string;
    latitude: number;
    longitude: number;
    address: string;
    images: string[];
    cover_image: string;
  }): Observable<any> {
    const query = `
      mutation CreateListing(
        $category: String!,
        $price: Float!,
        $details: String!,
        $latitude: Float!,
        $longitude: Float!,
        $address: String!,
        $images: [String!]!,
        $coverImage: String!
      ) {
        createListing(input: {
          category: $category,
          price: $price,
          details: $details,
          latitude: $latitude,
          longitude: $longitude,
          address: $address,
          images: $images,
          cover_image: $coverImage
        }) {
          status
          message
          listing {
            id
            category
            price
            details
            latitude
            longitude
            address
            images
            cover_image
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: {
        category: input.category,
        price: input.price,
        details: input.details,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        images: input.images,
        coverImage: input.cover_image,
      }
    });
  }

  logout(autoRedirect: boolean = true): Observable<any> {
    const query = `
      mutation {
        logout {
          status
          message
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query }).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_timestamp');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/']);
      }),
      catchError(() => {
        // Even if server call fails, clear local state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_timestamp');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/']);
        return of(null);
      })
    );
  }

  checkAuth(): void {
    const token = localStorage.getItem('auth_token');
    const timestampStr = localStorage.getItem('auth_timestamp');

    if (!token) {
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      const currentPath = this.router.url.split('?')[0];
      const isPublic = 
        currentPath === '/login' ||
        currentPath === '/signup' ||
        currentPath === '/landing' ||
        currentPath === '/' ||
        currentPath === '/showcase' ||
        currentPath === '/listings' ||
        currentPath.startsWith('/listings/');

      if (!isPublic) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      }
      return;
    }

    // If timestamp is missing but token is present, initialize it (migration)
    if (!timestampStr) {
      localStorage.setItem('auth_timestamp', Date.now().toString());
      return this.checkAuth();
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const expiry = 5 * 60 * 1000; // 5 minutes
    const elapsed = now - timestamp;

    if (elapsed > expiry) {
      console.warn('Session expired due to inactivity (5 minute limit).');
      this.logout(true).subscribe();
      return;
    }

    // Note: We no longer unconditionally refresh the timestamp here.
    // The setupActivityListeners method handles updating it based on actual user interaction.

    const query = `
      query {
        me {
          id
          username
          first_name
          last_name
          email
          role
          permissions
          landlord_status
        }
      }
    `;

    this.http.post<any>(this.apiUrl, { query }).subscribe({
      next: (response) => {
        if (response.data?.me) {
          this.currentUser.set(response.data.me);
          this.isAuthenticated.set(true);
        } else {
          console.error('Session invalid on server.');
          this.logout(true).subscribe();
        }
      },
      error: (err) => {
        console.error('Auth check failed:', err);
        // Only logout if it's an auth error (401), not a network error
        if (err.status === 401 || err.status === 403) {
          this.logout(true).subscribe();
        }
      }
    });
  }
}
