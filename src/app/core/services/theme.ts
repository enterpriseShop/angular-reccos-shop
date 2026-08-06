import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  // Signal for theme mode
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('reccos_theme');
      if (savedTheme) {
        this.isDarkMode.set(savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkMode.set(prefersDark);
      }

      // Sync DOM whenever isDarkMode changes
      effect(() => {
        const dark = this.isDarkMode();
        if (dark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('reccos_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('reccos_theme', 'light');
        }
      });
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update((dark) => !dark);
  }

  setDarkMode(enabled: boolean): void {
    this.isDarkMode.set(enabled);
  }
}
