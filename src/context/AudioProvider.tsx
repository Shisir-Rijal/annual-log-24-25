import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

// ============================================
// SIMPLIFIED AUDIO ARCHITECTURE
// Single BGM loop + SFX + Smart Ducking
// ============================================

const SOUNDTRACK_PATH = '/audio/soundtrack_2.mp3';

interface AudioContextType {
  // State
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isVinylPlaying: boolean;

  // BGM Controls
  playMainBGM: (startTime?: number) => void;
  pauseMainBGM: () => void;
  resumeMainBGM: () => void;
  setBGMVolume: (volume: number) => void;

  // SFX Controls
  playSFX: (path: string) => HTMLAudioElement | null;

  // Smart Ducking (for SoundtrackSlide)
  startVinylMode: () => void;
  stopVinylMode: () => void;

  // Settings
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ============================================
  // STATE
  // ============================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isVinylPlaying, setIsVinylPlaying] = useState(false);

  // ============================================
  // REFS
  // ============================================
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const savedVolumeRef = useRef(0.5); // Store volume before ducking
  const fadeIntervalRef = useRef<number | null>(null);
  const isUnlockedRef = useRef(false);

  // ============================================
  // AUDIO CONTEXT UNLOCK (Browser requirement)
  // ============================================
  useEffect(() => {
    const unlockAudio = () => {
      if (!isUnlockedRef.current) {
        const silentAudio = new Audio();
        silentAudio.volume = 0;
        silentAudio.play().catch(() => {});
        isUnlockedRef.current = true;
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => window.addEventListener(event, unlockAudio, { once: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, unlockAudio));
    };
  }, []);

  // ============================================
  // VOLUME SYNC
  // ============================================
  useEffect(() => {
    if (bgmRef.current && !isVinylPlaying) {
      bgmRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, isVinylPlaying]);

  // ============================================
  // CLEANUP
  // ============================================
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // ============================================
  // BGM CONTROLS
  // ============================================

  /**
   * playMainBGM - Starts the main soundtrack loop
   * @param startTime - Optional start time in seconds (default: 0)
   */
  const playMainBGM = useCallback((startTime: number = 0) => {
    // Create audio instance if needed
    if (!bgmRef.current) {
      bgmRef.current = new Audio(SOUNDTRACK_PATH);
      bgmRef.current.loop = true;
      bgmRef.current.volume = isMuted ? 0 : volume;

      bgmRef.current.addEventListener('error', (e) => {
        console.error('[AudioProvider] BGM Error:', e);
        setIsPlaying(false);
      });

      bgmRef.current.addEventListener('ended', () => {
        // Should not happen with loop=true, but safety check
        if (!bgmRef.current?.loop) {
          setIsPlaying(false);
        }
      });
    }

    // Set start time and play
    bgmRef.current.currentTime = startTime;

    bgmRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.warn('[AudioProvider] BGM autoplay blocked:', error.message);
        setIsPlaying(false);
      });
  }, [volume, isMuted]);

  /**
   * pauseMainBGM - Pauses the main soundtrack
   */
  const pauseMainBGM = useCallback(() => {
    if (bgmRef.current && isPlaying) {
      bgmRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  /**
   * resumeMainBGM - Resumes the main soundtrack
   */
  const resumeMainBGM = useCallback(() => {
    if (bgmRef.current && !isPlaying) {
      bgmRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn('[AudioProvider] BGM resume blocked:', error.message);
        });
    }
  }, [isPlaying]);

  /**
   * setBGMVolume - Smoothly changes BGM volume
   * @param newVolume - Volume between 0 and 1
   */
  const setBGMVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    // Smooth fade
    if (bgmRef.current && !isVinylPlaying) {
      const startVolume = bgmRef.current.volume;
      const volumeDiff = clampedVolume - startVolume;
      const duration = 300; // 300ms fade
      const steps = 20;
      const stepDuration = duration / steps;
      let currentStep = 0;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        
        if (currentStep >= steps || !bgmRef.current) {
          if (bgmRef.current) {
            bgmRef.current.volume = clampedVolume;
          }
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          return;
        }

        const newVolume = startVolume + (volumeDiff * (currentStep / steps));
        const clampedNewVolume = Math.max(0, Math.min(1, newVolume));
        if (bgmRef.current) {
          bgmRef.current.volume = clampedNewVolume;
        }
      }, stepDuration);
    }
  }, [isVinylPlaying]);

  // ============================================
  // SFX CONTROLS
  // ============================================

  /**
   * playSFX - Plays a one-shot sound effect
   * @param path - Path to the audio file
   * @returns The audio instance (for cleanup if needed)
   */
  const playSFX = useCallback((path: string): HTMLAudioElement | null => {
    const sfxAudio = new Audio(path);
    sfxAudio.volume = isMuted ? 0 : 0.8; // Fixed SFX volume at 80%
    
    sfxAudio.play()
      .catch((error) => {
        console.warn('[AudioProvider] SFX blocked:', error.message);
      });

    // Cleanup after playback
    sfxAudio.addEventListener('ended', () => {
      sfxAudio.remove();
    });

    sfxAudio.addEventListener('error', () => {
      console.error('[AudioProvider] SFX error:', path);
    });

    return sfxAudio;
  }, [isMuted]);

  // ============================================
  // SMART DUCKING (for SoundtrackSlide)
  // ============================================

  /**
   * startVinylMode - Ducks BGM when vinyl is playing
   */
  const startVinylMode = useCallback(() => {
    if (isVinylPlaying) return; // Already ducking

    setIsVinylPlaying(true);
    
    if (bgmRef.current) {
      // Save current volume
      savedVolumeRef.current = bgmRef.current.volume;
      
      // Fade BGM to 0 over 500ms
      const startVolume = bgmRef.current.volume;
      const duration = 500;
      const steps = 20;
      const stepDuration = duration / steps;
      let currentStep = 0;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        
        if (currentStep >= steps || !bgmRef.current) {
          if (bgmRef.current) {
            bgmRef.current.volume = 0;
          }
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          return;
        }

        const newVolume = startVolume * (1 - (currentStep / steps));
        if (bgmRef.current) {
          bgmRef.current.volume = newVolume;
        }
      }, stepDuration);
    }

  }, [isVinylPlaying]);

  /**
   * stopVinylMode - Restores BGM when vinyl stops
   */
  const stopVinylMode = useCallback(() => {
    if (!isVinylPlaying) return; // Not ducking

    setIsVinylPlaying(false);

    if (bgmRef.current) {
      // Restore saved volume (or use current volume state)
      const targetVolume = isMuted ? 0 : savedVolumeRef.current || volume;
      
      // Fade BGM back in over 500ms
      const startVolume = bgmRef.current.volume;
      const duration = 500;
      const steps = 20;
      const stepDuration = duration / steps;
      let currentStep = 0;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        
        if (currentStep >= steps || !bgmRef.current) {
          if (bgmRef.current) {
            bgmRef.current.volume = targetVolume;
          }
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          return;
        }

        const newVolume = startVolume + ((targetVolume - startVolume) * (currentStep / steps));
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        if (bgmRef.current) {
          bgmRef.current.volume = clampedVolume;
        }
      }, stepDuration);
    }

  }, [isVinylPlaying, volume, isMuted]);

  // ============================================
  // SETTINGS
  // ============================================

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (bgmRef.current && !isVinylPlaying) {
        bgmRef.current.volume = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume, isVinylPlaying]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AudioContextType = {
    // State
    isPlaying,
    isMuted,
    volume,
    isVinylPlaying,

    // BGM Controls
    playMainBGM,
    pauseMainBGM,
    resumeMainBGM,
    setBGMVolume,

    // SFX Controls
    playSFX,

    // Smart Ducking
    startVinylMode,
    stopVinylMode,

    // Settings
    toggleMute,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Custom hook for easy access
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioProvider;
