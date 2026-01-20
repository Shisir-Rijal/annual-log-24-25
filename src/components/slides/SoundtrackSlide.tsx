import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TOP_SONGS } from '../../data/topSongs';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAudio } from '@/context/AudioProvider';

const SoundtrackSlide = () => {
  const prefersReducedMotion = useReducedMotion();
  const { startVinylMode, stopVinylMode } = useAudio();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [focusedId, setFocusedId] = useState<number | null>(null);
  
  // Ref für das Audio-Objekt
  const vinylAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Ref für die Section (für Intersection Observer)
  const sectionRef = useRef<HTMLElement>(null);

  // ------------------------------------------------------------
  // STOP LOGIC - Split into two functions to fix song switching bug
  // ------------------------------------------------------------

  /**
   * stopLocalAudioOnly - Only stops the audio, keeps BGM paused (for song switching)
   */
  const stopLocalAudioOnly = useCallback(() => {
    if (vinylAudioRef.current) {
      vinylAudioRef.current.pause();
      vinylAudioRef.current.currentTime = 0;
      vinylAudioRef.current = null;
    }
    // NOTE: Does NOT call stopVinylMode() or setPlayingSongId(null)
    // This allows seamless switching between songs without resuming BGM
  }, []);

  /**
   * fullStop - Stops audio, resets state, and restores Global BGM
   */
  const fullStop = useCallback(() => {
    // 1. Stop local audio
    stopLocalAudioOnly();
    // 2. Reset state
    setPlayingSongId(null);
    // 3. Restore Global BGM
    stopVinylMode();
  }, [stopLocalAudioOnly, stopVinylMode]);

  // Ref for cleanup (avoids useEffect dependency issues)
  const fullStopRef = useRef(fullStop);
  
  useEffect(() => {
    fullStopRef.current = fullStop;
  });

  // INTERSECTION OBSERVER: Stop vinyl when slide leaves viewport
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && playingSongId !== null) {
            fullStopRef.current();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of slide is out of viewport
        rootMargin: '-10% 0px -10% 0px', // Add some margin for smoother transitions
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [playingSongId]); // Re-run when playingSongId changes

  // CLEANUP: Only on unmount (user scrolls away)
  useEffect(() => {
    return () => {
      // Call fullStop to restore BGM when leaving the slide
      fullStopRef.current();
    };
  }, []); // Empty array = only runs on unmount

  // ------------------------------------------------------------
  // PLAY LOGIC
  // ------------------------------------------------------------
  
  const handlePlay = useCallback((song: typeof TOP_SONGS[0]) => {
    if (playingSongId === song.id) {
      fullStop();
      return;
    }

    stopLocalAudioOnly();
    
    // Create new audio instance
    const audioPath = `/music/${song.id}.mp3`;
    const audio = new Audio(audioPath);
    audio.volume = 0.5;
    
    // Store in ref IMMEDIATELY (critical: must survive re-renders)
    vinylAudioRef.current = audio;

    // Set up event handlers - use fullStop (restore BGM when song ends)
    audio.onended = () => {
      fullStop();
    };

    audio.onerror = (e) => {
      console.error('[SoundtrackSlide] Vinyl Error (File missing?):', audioPath, e);
      fullStop();
    };

    // Play audio
    audio.play().catch((e) => {
      console.error('[SoundtrackSlide] Play failed:', e);
      fullStop();
    });

    setPlayingSongId(song.id);
    startVinylMode();

  }, [playingSongId, stopLocalAudioOnly, fullStop, startVinylMode]);

  return (
    <section ref={sectionRef} className="section-slide bg-gradient-slide-10 noise">
      {/* Title - Top Right */}
      <div className="absolute top-8 right-8 text-right z-10">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
          SOUNDTRACK_OF_THE_GRIND
        </p>
        <h2 className="text-display text-4xl md:text-5xl">
          <span className="text-foreground">THE</span>
          <span className="text-primary neon-text"> PLAYLIST</span>
        </h2>
      </div>

      {/* Main Container - Centered with Left Offset */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Offset wrapper */}
        <div className="relative -translate-x-[15%] md:-translate-x-[20%]">
          {/* Vinyl Stack - Vertical Column */}
          <div className="flex flex-col gap-3">
            {TOP_SONGS.map((song) => {
              const isHovered = hoveredId === song.id;
              const isPlaying = playingSongId === song.id;
              const isFocused = focusedId === song.id;
              const showPanel = isHovered || isPlaying || isFocused;

              return (
                <div
                  key={song.id}
                  className={`relative flex items-center transition-all duration-300 ease-out ${
                    isHovered || isFocused ? 'z-50' : 'z-10'
                  }`}
                  onMouseEnter={() => setHoveredId(song.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* VINYL DISC */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Play ${song.title} by ${song.artist}`}
                    aria-pressed={isPlaying}
                    onClick={() => handlePlay(song)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePlay(song);
                      }
                    }}
                    onFocus={() => setFocusedId(song.id)}
                    onBlur={() => setFocusedId(null)}
                    className={`
                      w-28 h-28 md:w-36 md:h-36 rounded-full relative cursor-pointer
                      shadow-xl transition-all duration-300
                      focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CCFF00]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                      ${isHovered || isFocused ? 'scale-110 shadow-[0_0_50px_var(--glow-color)]' : ''}
                      ${isPlaying ? 'shadow-[0_0_30px_var(--glow-color)]' : ''}
                    `}
                    style={{
                      '--glow-color': song.color,
                      background: 'repeating-radial-gradient(#111 0, #111 2px, #1a1a1a 3px, #222 4px)'
                    } as React.CSSProperties}
                  >
                    {/* Spinning Inner Disc */}
                    <div
                      className={`
                        w-full h-full rounded-full flex items-center justify-center
                        ${!prefersReducedMotion && (isPlaying 
                          ? 'animate-[spin_1.5s_linear_infinite]' 
                          : 'animate-[spin_12s_linear_infinite]'
                        )}
                      `}
                    >
                      <div className="absolute inset-0 rounded-full opacity-15 bg-[conic-gradient(transparent_0deg,white_30deg,transparent_60deg,transparent_180deg,white_210deg,transparent_240deg)]" />

                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-[3px] border-black z-10 relative">
                        <img
                          src={song.cover}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full border border-gray-800" />
                      </div>
                    </div>

                    {/* Playing indicator */}
                    {isPlaying && (
                      <div 
                        className="absolute -top-1 -right-1 w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-[0_0_10px_#CCFF00]"
                        aria-hidden="true"
                      >
                        <div className="w-0 h-0 border-l-[5px] border-l-black border-y-[3px] border-y-transparent ml-0.5" />
                      </div>
                    )}
                  </div>

                  {/* INFO PANEL */}
                  <div
                    className={`
                      absolute left-[7rem] md:left-[9rem]
                      h-20 flex items-center
                      transition-all duration-500 ease-out
                      overflow-hidden
                      ${showPanel ? 'w-[280px] opacity-100' : 'w-0 opacity-0'}
                    `}
                  >
                    <div
                      className="
                        h-full w-full
                        bg-black/70 backdrop-blur-xl
                        border-y border-r border-white/10
                        rounded-r-xl
                        flex flex-col justify-center
                        px-6 py-4
                        whitespace-nowrap
                      "
                      style={{
                        boxShadow: `inset 0 0 30px ${song.color}10, 0 0 20px rgba(0,0,0,0.5)`
                      }}
                    >
                      <h3 className="text-lg md:text-xl font-black text-white leading-tight truncate">
                        {song.title}
                      </h3>
                      <p className="font-mono text-xs uppercase tracking-widest truncate" style={{ color: song.color }}>
                        {song.artist}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="font-mono text-xs text-gray-600 tracking-widest">
          HOVER TO REVEAL • CLICK TO PLAY
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default SoundtrackSlide;