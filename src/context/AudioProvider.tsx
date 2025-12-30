import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface PlayBGMOptions {
  startTime?: number;
  loop?: boolean;
}

interface AudioContextType {
  // State
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  currentBgmPath: string | null;
  isPlaying: boolean;

  // BGM Controls
  playBGM: (path: string, options?: PlayBGMOptions) => void;
  pauseBGM: () => void;
  resumeBGM: () => void;
  stopBGM: () => void;
  fadeBGM: (toVolume: number, duration: number) => void;
  getBgmCurrentTime: () => number;
  seekBGM: (time: number) => void;

  // SFX Controls
  playSFX: (path: string) => void;

  // Settings
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [bgmVolume, setBgmVolumeState] = useState(0.3);
  const [sfxVolume, setSfxVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBgmPath, setCurrentBgmPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs for persistent audio instances
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const isUnlockedRef = useRef(false);

  // Unlock audio context on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!isUnlockedRef.current) {
        // Create a silent audio context to unlock
        const silentAudio = new Audio();
        silentAudio.volume = 0;
        silentAudio.play().catch(() => {});
        isUnlockedRef.current = true;
        console.log('[AudioProvider] Audio context unlocked');
      }
    };

    // Listen for user interaction to unlock audio
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => window.addEventListener(event, unlockAudio, { once: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, unlockAudio));
    };
  }, []);

  // Update BGM volume when state changes
  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // ============================================
  // BGM CONTROLS
  // ============================================

  const playBGM = useCallback((path: string, options?: PlayBGMOptions) => {
    const { startTime = 0, loop = true } = options || {};

    // Stop current BGM if playing something different
    if (bgmAudioRef.current && currentBgmPath !== path) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current = null;
    }

    // Create new audio instance if needed
    if (!bgmAudioRef.current || currentBgmPath !== path) {
      bgmAudioRef.current = new Audio(path);
      bgmAudioRef.current.loop = loop;
      bgmAudioRef.current.volume = isMuted ? 0 : bgmVolume;

      // Event listeners
      bgmAudioRef.current.addEventListener('ended', () => {
        if (!loop) {
          setIsPlaying(false);
        }
      });

      bgmAudioRef.current.addEventListener('error', (e) => {
        console.error('[AudioProvider] BGM Error:', e);
        setIsPlaying(false);
      });
    }

    // Set start time and play
    bgmAudioRef.current.currentTime = startTime;
    
    bgmAudioRef.current.play()
      .then(() => {
        setCurrentBgmPath(path);
        setIsPlaying(true);
        console.log('[AudioProvider] BGM playing:', path);
      })
      .catch((error) => {
        // Autoplay was blocked - this is expected before user interaction
        console.warn('[AudioProvider] BGM autoplay blocked:', error.message);
        setIsPlaying(false);
      });
  }, [currentBgmPath, bgmVolume, isMuted]);

  const pauseBGM = useCallback(() => {
    if (bgmAudioRef.current && isPlaying) {
      bgmAudioRef.current.pause();
      setIsPlaying(false);
      console.log('[AudioProvider] BGM paused');
    }
  }, [isPlaying]);

  const resumeBGM = useCallback(() => {
    if (bgmAudioRef.current && !isPlaying && currentBgmPath) {
      bgmAudioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          console.log('[AudioProvider] BGM resumed');
        })
        .catch((error) => {
          console.warn('[AudioProvider] BGM resume blocked:', error.message);
        });
    }
  }, [isPlaying, currentBgmPath]);

  const stopBGM = useCallback(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current.currentTime = 0;
      bgmAudioRef.current = null;
      setCurrentBgmPath(null);
      setIsPlaying(false);
      console.log('[AudioProvider] BGM stopped');
    }
  }, []);

  const fadeBGM = useCallback((toVolume: number, duration: number) => {
    if (!bgmAudioRef.current) return;

    // Clear any existing fade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const startVolume = bgmAudioRef.current.volume;
    const volumeDiff = toVolume - startVolume;
    const steps = 20; // Number of steps for smooth fade
    const stepDuration = duration / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps || !bgmAudioRef.current) {
        if (bgmAudioRef.current) {
          bgmAudioRef.current.volume = toVolume;
        }
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        console.log('[AudioProvider] Fade complete, volume:', toVolume);
        return;
      }

      const newVolume = startVolume + (volumeDiff * (currentStep / steps));
      bgmAudioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }, stepDuration);
  }, []);

  const getBgmCurrentTime = useCallback((): number => {
    return bgmAudioRef.current?.currentTime ?? 0;
  }, []);

  const seekBGM = useCallback((time: number) => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.currentTime = time;
      console.log('[AudioProvider] BGM seeked to:', time);
    }
  }, []);

  // ============================================
  // SFX CONTROLS (Fire-and-Forget)
  // ============================================

  const playSFX = useCallback((path: string) => {
    const sfxAudio = new Audio(path);
    sfxAudio.volume = isMuted ? 0 : sfxVolume;
    
    sfxAudio.play()
      .then(() => {
        console.log('[AudioProvider] SFX playing:', path);
      })
      .catch((error) => {
        console.warn('[AudioProvider] SFX blocked:', error.message);
      });

    // Cleanup after playback
    sfxAudio.addEventListener('ended', () => {
      sfxAudio.remove();
    });
  }, [sfxVolume, isMuted]);

  // ============================================
  // SETTINGS
  // ============================================

  const setBgmVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setBgmVolumeState(clampedVolume);
    if (bgmAudioRef.current && !isMuted) {
      bgmAudioRef.current.volume = clampedVolume;
    }
  }, [isMuted]);

  const setSfxVolume = useCallback((volume: number) => {
    setSfxVolumeState(Math.max(0, Math.min(1, volume)));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (bgmAudioRef.current) {
        bgmAudioRef.current.volume = newMuted ? 0 : bgmVolume;
      }
      return newMuted;
    });
  }, [bgmVolume]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AudioContextType = {
    // State
    bgmVolume,
    sfxVolume,
    isMuted,
    currentBgmPath,
    isPlaying,

    // BGM Controls
    playBGM,
    pauseBGM,
    resumeBGM,
    stopBGM,
    fadeBGM,
    getBgmCurrentTime,
    seekBGM,

    // SFX Controls
    playSFX,

    // Settings
    setBgmVolume,
    setSfxVolume,
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

