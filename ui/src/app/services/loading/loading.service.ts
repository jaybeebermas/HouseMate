import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count = signal(0);

  /** True while any pending load is active */
  readonly isLoading = computed(() => this._count() > 0);

  show(): void {
    this._count.update(c => c + 1);
  }

  hide(): void {
    this._count.update(c => Math.max(0, c - 1));
  }

  /** Wrap an observable to automatically show/hide the global loader */
  wrap<T>(obs: Observable<T>): Observable<T> {
    this.show();
    return obs.pipe(finalize(() => this.hide()));
  }
}
