import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BarangayConfigService {
    logoUrl = signal<string | null>(null);

    constructor() {
        this.fetchLogo();
    }

    async fetchLogo(): Promise<void> {
        // Mocked or empty for HouseMate
    }

    updateLogo(path: string | null): void {
        if (path) {
            this.logoUrl.set(`/storage/${path}`);
        } else {
            this.logoUrl.set(null);
        }
    }
}
