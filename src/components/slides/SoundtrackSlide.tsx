import React from 'react';
import { TOP_SONGS } from '../../data/topSongs';

const SoundtrackSlide = () => {
  return (
    <section className="section-slide bg-gradient-slide-10 noise">
      {/* Header */}
      <div className="absolute top-8 left-8">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          SOUNDTRACK_OF_THE_GRIND
        </p>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <h2 className="text-display text-large text-center mb-2">
          <span className="text-foreground">THE</span>
          <span className="text-primary neon-text"> PLAYLIST</span>
        </h2>
        <p className="font-mono text-sm text-muted-foreground mb-12">
          TOP 5 TRACKS THAT POWERED THE GRIND
        </p>

        <div className="flex flex-wrap gap-8 justify-center items-center">
          {TOP_SONGS.map((song, index) => (
            <div
              key={song.id}
              className="group relative w-48 h-48 cursor-pointer transition-all duration-500 ease-out hover:z-50"
              style={{
                animation: `float 3s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`
              }}
            >
              {/* VINYL DISC */}
              <div
                className="w-full h-full rounded-full relative shadow-xl transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_30px_var(--glow-color)]"
                style={{
                  '--glow-color': song.color,
                  background: 'repeating-radial-gradient(#111 0, #111 2px, #222 3px, #222 4px)'
                } as React.CSSProperties}
              >
                {/* Spinning Container */}
                <div className="w-full h-full rounded-full animate-[spin_6s_linear_infinite] group-hover:[animation-play-state:paused] flex items-center justify-center">
                  {/* Grooves / Shine Effect */}
                  <div className="absolute inset-0 rounded-full opacity-20 bg-[conic-gradient(transparent_0deg,white_45deg,transparent_90deg,transparent_180deg,white_225deg,transparent_270deg)]"></div>

                  {/* Album Label */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-black z-10 relative">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Center Hole */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>

                {/* HOVER OVERLAY (Info) */}
                <div className="absolute inset-0 rounded-full bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-[#CCFF00] text-xs font-bold italic mb-2">
                    "{song.quote}"
                  </p>
                  <div className="mt-2">
                    <p className="text-white font-bold text-sm leading-tight">
                      {song.title}
                    </p>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider">
                      {song.artist}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for custom float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  );
};

export default SoundtrackSlide;

