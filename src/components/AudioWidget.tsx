import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipForward, SkipBack, Music2, Loader2 } from 'lucide-react';
import { PLAYLIST } from '../data/playlist';

const AudioWidget = () => {
  const [mounted, setMounted] = useState(false);

  // State: User WANTS music (Intent)
  const [userWantsPlay, setUserWantsPlay] = useState(false);

  // State: Player IS ready (System)
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Debounce for clicking

  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const song = PLAYLIST[currentIndex];

  // --- HANDLERS ---

  const handleNext = () => {
    setIsPlayerReady(false); // Reset ready state
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
    // Keep user intent as is (if playing, keep playing)
  };

  const handlePrev = () => {
    setIsPlayerReady(false);
    setCurrentIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const togglePlay = () => {
    if (isLocked) return; // Prevent spam-clicking

    setIsLocked(true);
    setUserWantsPlay(!userWantsPlay);
    // Unlock interaction after 500ms
    setTimeout(() => setIsLocked(false), 500);
  };

  // Actual playing command sent to player:
  // Only play if User Wants it AND Player is Ready.
  const playerShouldPlay = userWantsPlay && isPlayerReady;

  return (
    <>
      {/* --- HIDDEN SOUNDCLOUD ENGINE --- */}
      {/* STRATEGY: Large dimensions (300x300) to satisfy browser loading policies. */}
      {/* Hiding: opacity-0 + z-index -1 + fixed position */}
      <div className="fixed bottom-0 right-0 w-[300px] h-[300px] opacity-0 pointer-events-none z-[-1]">
        <ReactPlayer
          ref={playerRef}
          url={song.url}
          playing={playerShouldPlay}
          volume={1.0}
          width="100%"
          height="100%"
          onReady={() => {
            console.log('[AudioWidget] Player Ready');
            setIsPlayerReady(true);
          }}
          onStart={() => console.log('[AudioWidget] Playback Started')}
          onEnded={handleNext}
          onError={(e) => {
            console.error('[AudioWidget] Error:', e);
            handleNext(); // Skip broken tracks
          }}
          config={{
            soundcloud: {
              options: {
                auto_play: false,
                show_artwork: false,
                show_user: false
              }
            }
          }}
        />
      </div>

      {/* --- UI OVERLAY --- */}
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center justify-end font-sans"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`
            bg-black/60 backdrop-blur-md border border-white/10 rounded-full 
            shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out
            flex items-center overflow-hidden
            ${isHovered ? 'pr-6 pl-4 py-3 gap-4 w-auto' : 'p-3 w-[50px] justify-center'}
          `}
        >
          {/* PLAY BUTTON / SPINNER */}
          <div
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center relative cursor-pointer"
            onClick={togglePlay}
          >
            {/* Case 1: User clicked Play, but waiting for SC to load -> SPINNER */}
            {userWantsPlay && !isPlayerReady ? (
              <Loader2 size={20} className="text-[#CCFF00] animate-spin" />
            ) : /* Case 2: Playing active -> BARS */
            userWantsPlay ? (
              <div className="flex items-end gap-[2px] h-4">
                <div className="w-1 bg-[#CCFF00] animate-[bounce_1s_infinite] h-full"></div>
                <div className="w-1 bg-[#CCFF00] animate-[bounce_1.2s_infinite] h-2/3"></div>
                <div className="w-1 bg-[#CCFF00] animate-[bounce_0.8s_infinite] h-full"></div>
              </div>
            ) : (
              /* Case 3: Paused -> MUSIC ICON */
              <Music2 size={20} className="text-white/80" />
            )}
          </div>

          {/* CONTROLS (Only visible on hover) */}
          <div
            className={`flex items-center gap-4 transition-all duration-300 ${
              isHovered ? 'opacity-100 max-w-[300px]' : 'opacity-0 max-w-0 hidden'
            }`}
          >
            <div className="flex flex-col min-w-[100px] max-w-[140px]">
              <span className="text-xs font-bold text-white truncate">{song.title}</span>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider truncate">
                {song.artist}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#CCFF00] flex items-center justify-center hover:bg-white transition-colors text-black"
              >
                {userWantsPlay ? (
                  <Pause size={14} fill="black" />
                ) : (
                  <Play size={14} fill="black" className="ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioWidget;
