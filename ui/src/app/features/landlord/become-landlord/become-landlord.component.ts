import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { SwitchComponent } from '../../../shared/components/ui/switch/switch.component';

@Component({
  selector: 'app-become-landlord',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SwitchComponent],
  templateUrl: './become-landlord.component.html',
  styleUrl: './become-landlord.component.css'
})
export class BecomeLandlordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  landlordForm: FormGroup;
  currentStep = signal(1);
  isLoading = signal(false);
  isSubmitted = signal(false);
  
  // Drag and drop state
  isDragging = signal(false);
  selectedFileName = signal<string | null>(null);
  selectedFileSize = signal<string | null>(null);

  constructor() {
    this.landlordForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(09|\+639)\d{9}$/)]],
      validIdName: ['', [Validators.required]],
      agree: [false, [Validators.requiredTrue]]
    });
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep() === 1 && this.landlordForm.get('phoneNumber')?.invalid) {
      this.landlordForm.get('phoneNumber')?.markAsTouched();
      return;
    }
    if (this.currentStep() === 2 && this.landlordForm.get('validIdName')?.invalid) {
      this.toastService.show('Please upload a valid ID to proceed.', 'error', 'Error');
      return;
    }
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    } else if (step === 2 && this.landlordForm.get('phoneNumber')?.valid) {
      this.currentStep.set(step);
    } else if (step === 3 && this.landlordForm.get('phoneNumber')?.valid && this.landlordForm.get('validIdName')?.valid) {
      this.currentStep.set(step);
    }
  }

  // File upload drag-and-drop handling
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

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.toastService.show('Please upload a valid ID in JPG, PNG, WEBP, or PDF format.', 'error', 'Invalid File Type');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.toastService.show('Maximum file size allowed is 5MB.', 'error', 'File Too Large');
      return;
    }

    this.selectedFileName.set(file.name);
    
    // Format size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    this.selectedFileSize.set(`${sizeInMB} MB`);

    this.landlordForm.patchValue({
      validIdName: file.name
    });
    this.landlordForm.get('validIdName')?.updateValueAndValidity();
    
    // Automatically transition to next step after a short delay for premium UX feel
    setTimeout(() => {
      this.nextStep();
    }, 600);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFileName.set(null);
    this.selectedFileSize.set(null);
    this.landlordForm.patchValue({
      validIdName: ''
    });
    this.landlordForm.get('validIdName')?.updateValueAndValidity();
  }

  // Form submission
  onSubmit(): void {
    if (this.landlordForm.invalid) {
      this.landlordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { phoneNumber, validIdName } = this.landlordForm.value;

    this.authService.becomeLandlord(phoneNumber, validIdName).subscribe({
      next: (res) => {
        const data = res.data?.becomeLandlord;
        if (data && data.status === 'SUCCESS') {
          this.isSubmitted.set(true);
          this.toastService.show('Application submitted! Awaiting admin approval.', 'success', 'Submitted');
        } else {
          this.toastService.show(data?.message || 'Failed to submit application.', 'error', 'Submission Failed');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.show(err.message || 'An error occurred. Please try again.', 'error', 'System Error');
        this.isLoading.set(false);
      }
    });
  }

  goBackHome(): void {
    this.router.navigate(['/']);
  }
}
