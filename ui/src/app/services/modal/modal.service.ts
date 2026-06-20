import { Injectable, signal, TemplateRef } from '@angular/core';

export interface ModalOptions {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showFooter?: boolean;
  type?: 'primary' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isOpen = signal(false);
  options = signal<ModalOptions>({ title: '' });
  content = signal<TemplateRef<any> | null>(null);
  
  // Callbacks
  onConfirm: () => void = () => {};
  onClose: () => void = () => {};
  
  isLoading = signal(false);
  isConfirmDisabled = signal(false);

  open(content: TemplateRef<any>, options: ModalOptions) {
    this.content.set(content);
    this.options.set(options);
    this.isOpen.set(true);
    this.isLoading.set(false);
    this.isConfirmDisabled.set(false);
  }

  close() {
    this.isOpen.set(false);
    this.onClose();
    // Reset callbacks
    this.onConfirm = () => {};
    this.onClose = () => {};
  }

  setLoading(loading: boolean) {
    this.isLoading.set(loading);
  }

  setConfirmDisabled(disabled: boolean) {
    this.isConfirmDisabled.set(disabled);
  }
}
