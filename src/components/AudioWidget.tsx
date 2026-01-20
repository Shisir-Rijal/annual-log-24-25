import { useState } from 'react';
import { Volume2, VolumeX, Music2 } from 'lucide-react';
import { useAudio } from '@/context/AudioProvider';

const AudioWidget = () => {
  const { isPlaying, isMuted, toggleMute, volume } = useAudio();
  const [isHovered, setIsHovered] = useState(false);

  // Show animated bars only when playing AND not muted
  const shouldAnimate = isPlaying && !isMuted;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center justify-end font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          bg-black/60 backdrop-blur-md border border-white/10 rounded-full 
          shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out
          flex items-center overflow-hidden cursor-pointer
          ${isHovered ? 'pr-6 pl-4 py-3 gap-4 w-auto' : 'p-3 w-[50px] justify-center'}
          hover:border-[#CCFF00]/30
        `}
        onClick={toggleMute}
        role="button"
        tabIndex={0}
        aria-label={isMuted ? 'Unmute system audio' : 'Mute system audio'}
        aria-pressed={isMuted}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMute();
          }
        }}
      >
        {/* ICON / ANIMATION (Left Side) */}
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center relative">
          {isMuted ? (
            // MUTED: Show mute icon
            <VolumeX size={20} className="text-gray-400" />
          ) : shouldAnimate ? (
            // ACTIVE & PLAYING: Show animated bars
            <div className="flex items-end gap-[2px] h-4">
              <div className="w-1 bg-[#CCFF00] animate-[bounce_1s_infinite] h-full"></div>
              <div className="w-1 bg-[#CCFF00] animate-[bounce_1.2s_infinite] h-2/3"></div>
              <div className="w-1 bg-[#CCFF00] animate-[bounce_0.8s_infinite] h-full"></div>
            </div>
          ) : (
            // ACTIVE but NOT playing: Show sound icon
            <Volume2 size={20} className="text-white/80" />
          )}
        </div>

        {/* STATUS TEXT (Only visible on hover) */}
        <div
          className={`flex flex-col min-w-[100px] transition-all duration-300 ${
            isHovered ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 hidden'
          }`}
        >
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {isMuted ? 'MUTED' : 'ACTIVE'}
          </span>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest truncate">
            System Audio
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioWidget;
