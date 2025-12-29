import React, { useState, useRef, useCallback } from 'react';
import { TOP_SONGS } from '../../data/topSongs';

const SoundtrackSlide = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = useCallback((song: typeof TOP_SONGS[0]) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    console.log(`[SoundtrackSlide] Playing: ${song.title} by ${song.artist}`);
    setPlayingId(song.id);

    // Initialize audio with placeholder path
    const audioPath = `/music/${song.id}.mp3`;
    const audio = new Audio(audioPath);
    audioRef.current = audio;

    audio.play().catch((e) => {
      console.warn('[SoundtrackSlide] Audio file not found or blocked:', audioPath, e);
    });
  }, []);

  return (
    <section className="section-slide bg-gradient-slide-10 noise">
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
        {/* Offset wrapper - shifts stack to the left, leaving room for panels on right */}
        <div className="relative -translate-x-[15%] md:-translate-x-[20%]">
          {/* Vinyl Stack - Vertical Column */}
          <div className="flex flex-col gap-3">
            {TOP_SONGS.map((song) => {
              const isHovered = hoveredId === song.id;
              const isPlaying = playingId === song.id;

              return (
                <div
                  key={song.id}
                  className={`relative flex items-center transition-all duration-300 ease-out ${
                    isHovered ? 'z-50' : 'z-10'
                  }`}
                  onMouseEnter={() => setHoveredId(song.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* VINYL DISC - Upright, No Rotation */}
                  <div
                    onClick={() => handlePlay(song)}
                    className={`
                      w-28 h-28 md:w-36 md:h-36 rounded-full relative cursor-pointer
                      shadow-xl transition-all duration-300
                      ${isHovered ? 'scale-110 shadow-[0_0_50px_var(--glow-color)]' : ''}
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
                        ${isPlaying 
                          ? 'animate-[spin_1.5s_linear_infinite]' 
                          : isHovered 
                            ? '[animation-play-state:paused]'
                            : 'animate-[spin_8s_linear_infinite]'
                        }
                      `}
                    >
                      {/* Grooves / Shine Effect */}
                      <div className="absolute inset-0 rounded-full opacity-15 bg-[conic-gradient(transparent_0deg,white_30deg,transparent_60deg,transparent_180deg,white_210deg,transparent_240deg)]" />

                      {/* Album Label */}
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-[3px] border-black z-10 relative">
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Center Hole */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full border border-gray-800" />
                      </div>
                    </div>

                    {/* Playing indicator */}
                    {isPlaying && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-[0_0_10px_#CCFF00]">
                        <div className="w-0 h-0 border-l-[5px] border-l-black border-y-[3px] border-y-transparent ml-0.5" />
                      </div>
                    )}
                  </div>

                  {/* INFO PANEL - Expands from Right Edge of Vinyl */}
                  <div
                    className={`
                      absolute left-[7rem] md:left-[9rem]
                      h-20 flex items-center
                      transition-all duration-500 ease-out
                      overflow-hidden
                      ${isHovered 
                        ? 'w-[280px] opacity-100' 
                        : 'w-0 opacity-0'
                      }
                    `}
                  >
                    {/* Panel Content */}
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
                      <p
                        className="font-mono text-xs uppercase tracking-widest truncate"
                        style={{ color: song.color }}
                      >
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

      {/* Bottom instruction */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="font-mono text-xs text-gray-600 tracking-widest">
          HOVER TO REVEAL • CLICK TO PLAY
        </p>
      </div>

      {/* CSS for spin animation */}
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
