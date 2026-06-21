import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-required',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-required.component.html',
  styleUrl: './login-required.component.css'
})
export class LoginRequiredComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private returnUrl: string | null = null;

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
  }

  goToLogin(): void {
    const queryParams: any = {};
    if (this.returnUrl) {
      queryParams.returnUrl = this.returnUrl;
    }
    this.router.navigate(['/login'], { queryParams });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
