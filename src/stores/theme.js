import { writable } from 'svelte/store';

// Theme store
export const theme = writable('light');

// Initialize theme from localStorage or default to 'light'
export function initialize_theme() {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme.set(savedTheme);
    }
    
    // Subscribe to theme changes and save to localStorage
    theme.subscribe(value => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value);
        document.documentElement.setAttribute('data-theme', value);
      }
    });
  }
} 