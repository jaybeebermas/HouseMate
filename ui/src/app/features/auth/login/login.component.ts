import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NgIconComponent } from '@ng-icons/core';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleButtonLogin') googleButtonLoginRef!: ElementRef<HTMLDivElement>;
  
  private googleInitialized = false;
  private resizeTimeout: any = null;

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const user = this.authService.currentUser();
    if (user) {
      this.redirectUser(user);
    } else if (this.authService.isAuthenticated()) {
      effect(() => {
        const u = this.authService.currentUser();
        if (u) {
          this.redirectUser(u);
        }
      });
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showPassword.set(false);
  }

  ngAfterViewInit() {
    this.loadGoogleScript();
  }

  ngOnDestroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => this.renderGoogleButton(), 150);
  }

  loadGoogleScript(): void {
    if (typeof google !== 'undefined') {
      this.initGoogleAuth();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initGoogleAuth();
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script.');
    };
    document.head.appendChild(script);
  }

  initGoogleAuth(): void {
    if (typeof google === 'undefined') return;

    if (!this.googleInitialized) {
      google.accounts.id.initialize({
        client_id: '853052679545-ph5bitniubfnm4cq2pnmdogsnqn2qdre.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredentialResponse(response)
      });
      this.googleInitialized = true;
    }

    this.renderGoogleButton();
  }

  renderGoogleButton(): void {
    if (typeof google === 'undefined') return;

    const loginBtnContainer = this.googleButtonLoginRef?.nativeElement;
    if (loginBtnContainer) {
      loginBtnContainer.replaceChildren();
      google.accounts.id.renderButton(
        loginBtnContainer,
        {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: Math.floor(loginBtnContainer.parentElement?.clientWidth || loginBtnContainer.clientWidth || 382)
        }
      );
    }
  }

  handleGoogleCredentialResponse(response: any): void {
    if (!response.credential) {
      this.errorMessage.set('Google authentication failed.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (res) => {
        if (res.errors && res.errors.length > 0) {
          this.errorMessage.set(res.errors[0].message || 'Google login failed.');
          this.isLoading.set(false);
          return;
        }

        const data = res.data?.loginWithGoogle;
        if (data && data.status === 'SUCCESS') {
          this.redirectUser(data.user);
        } else {
          this.errorMessage.set(data?.message || 'Google login failed.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'An error occurred during Google login.');
        this.isLoading.set(false);
      }
    });
  }

  private redirectUser(user: any): void {
    const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'super_admin');
    
    let returnUrl = this.route.snapshot.queryParams['returnUrl'];
    
    if (returnUrl) {
      const decodedUrl = decodeURIComponent(returnUrl);
      // If the returnUrl is an authentication page, clear it to avoid loops
      if (
        decodedUrl.includes('login') || 
        decodedUrl.includes('signup') || 
        decodedUrl === '/login' || 
        decodedUrl === '/signup'
      ) {
        returnUrl = null;
      }
    }

    if (isAdmin) {
      const target = returnUrl || '/admin/dashboard';
      this.router.navigateByUrl(target);
    } else {
      const target = returnUrl || '/';
      this.router.navigateByUrl(target);
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        if (response.data?.login?.status === 'SUCCESS') {
          this.redirectUser(response.data.login.user);
        } else {
          this.errorMessage.set(response.data?.login?.message || 'Login failed.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'An error occurred during login.');
        this.isLoading.set(false);
      }
    });
  }
}
