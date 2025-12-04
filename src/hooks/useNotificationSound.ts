import { useCallback } from 'react';

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

/**
 * Hook for playing notification sounds
 */
export function useNotificationSound() {
  const playSound = useCallback((url?: string) => {
    const soundUrl = url || NOTIFICATION_SOUND_URL;
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    
    audio.play().catch((e) => {
      console.error("Audio play failed:", e);
    });
  }, []);

  return { playSound };
}

