/**
 * Application configuration
 * Centralized configuration values from environment variables
 */

export const config = {
  /**
   * Development mode flag
   * When true, bypasses password protection for easier development
   */
  developmentMode: import.meta.env.VITE_DEVELOPMENT_MODE === 'true' || false,

  /**
   * Application name
   */
  appName: import.meta.env.VITE_APP_NAME || 'Valet Parking Pro',
} as const;

