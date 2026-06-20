import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  title?: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast = signal<ToastMessage | null>(null);

  show(message: string, type: ToastType = 'success', title?: string) {
    this.toast.set({ message, type, title });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000); // Increased duration slightly for better readability
  }
}
