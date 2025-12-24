import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    isDarkMode = signal(false);

    toggleDarkMode() {
        this.isDarkMode.set(!this.isDarkMode());
    }
}
