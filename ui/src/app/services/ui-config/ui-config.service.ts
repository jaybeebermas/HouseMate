import { Injectable, signal, effect } from '@angular/core';

export type UIScale = 'small' | 'medium' | 'large' | 'xl';

@Injectable({
  providedIn: 'root'
})
export class UIConfigService {
  private readonly STORAGE_KEY = 'housemate_ui_scale';
  
  // Default to large since the user asked for "a little bigger"
  scale = signal<UIScale>('large');

  constructor() {
    // Automatically apply the scale to the document whenever it changes
    effect(() => {
      const currentScale = this.scale();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-size', currentScale);
        localStorage.setItem(this.STORAGE_KEY, currentScale);
      }
    });
  }

  setScale(newScale: UIScale): void {
    this.scale.set(newScale);
  }

  private getStoredScale(): UIScale | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.STORAGE_KEY) as UIScale;
  }
}
