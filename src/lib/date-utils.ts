/**
 * Date formatting utilities
 * Centralized date formatting functions used across the application
 */

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a time to a localized string
 */
export function formatTime(date: Date, locale: string = 'ar-SA'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date and time to a localized string
 */
export function formatDateTime(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date for Arabic locale with calendar
 */
export function formatDateArabic(date: Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory',
  }).format(date);
}

/**
 * Format currency in Kuwaiti Dinar
 */
export function formatCurrency(value: number): string {
  return value.toFixed(2) + " دينار كويتي";
}

