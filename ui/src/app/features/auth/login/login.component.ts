import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NgIconComponent } from '@ng-icons/core';

declare var google: any;

class Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  density: number;
  ctx: CanvasRenderingContext2D;

  constructor(x: number, y: number, color: string, ctx: CanvasRenderingContext2D) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.size = Math.random() * 2 + 1;
    this.color = color;
    this.density = (Math.random() * 40) + 5;
    this.ctx = ctx;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    // Drawing tiny vertical lines/rectangles as requested
    this.ctx.fillRect(this.x, this.y, 2, this.size * 3);
  }

  update(mouse: { x: number | null, y: number | null, radius: number }) {
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = mouse.radius;
      let force = (maxDistance - distance) / maxDistance;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;

      if (distance < mouse.radius) {
        this.x += directionX;
        this.y += directionY;
      } else {
        if (this.x !== this.baseX) {
          let dx = this.x - this.baseX;
          this.x -= dx / 15;
        }
        if (this.y !== this.baseY) {
          let dy = this.y - this.baseY;
          this.y -= dy / 15;
        }
      }
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 20;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 20;
      }
    }
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('googleButton') googleButtonRef!: ElementRef<HTMLDivElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private resizeTimeout: number | null = null;
  private googleInitialized = false;
  private mouse = {
    x: null as number | null,
    y: null as number | null,
    radius: 150
  };

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  isSignUp = signal(false);

  private googlePalette = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#F482B1'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Keep confirm_password in sync when password changes
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirm_password')?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm_password')?.value;
    if (password && confirm && password !== confirm) {
      group.get('confirm_password')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.animate();
    this.loadGoogleScript();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.initCanvas();
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = window.setTimeout(() => this.renderGoogleButton(), 150);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse.x = event.x;
    this.mouse.y = event.y;
  }

  @HostListener('window:mouseout')
  onMouseOut() {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.particles = [];
    const numberOfParticles = 400;
    for (let i = 0; i < numberOfParticles; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const color = this.googlePalette[Math.floor(Math.random() * this.googlePalette.length)];
      this.particles.push(new Particle(x, y, color, this.ctx));
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.mouse);
      this.particles[i].draw();
    }
    this.animationId = requestAnimationFrame(() => this.animate());
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
    const btnContainer = this.googleButtonRef?.nativeElement;
    if (btnContainer && typeof google !== 'undefined') {
      btnContainer.replaceChildren();
      google.accounts.id.renderButton(
        btnContainer,
        {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: Math.floor(btnContainer.parentElement?.clientWidth || btnContainer.clientWidth || 382)
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
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
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

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleMode(): void {
    this.isSignUp.update(v => !v);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.loginForm.reset();
    this.registerForm.reset();
    this.showPassword.set(false);

    if (!this.isSignUp()) {
      setTimeout(() => {
        this.renderGoogleButton();
      }, 0);
    }
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
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
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

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { username, first_name, last_name, email, password } = this.registerForm.value;

    this.authService.register({ username, first_name, last_name, email, password }).subscribe({
      next: (response) => {
        if (response.data?.register?.status === 'SUCCESS') {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(response.data?.register?.message || 'Registration failed.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'An error occurred during registration.');
        this.isLoading.set(false);
      }
    });
  }
}
