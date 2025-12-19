import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

const AudioWidget = () => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 glass rounded-full p-4 cursor-pointer transition-all duration-300 hover:scale-105 neon-glow"
      onClick={() => setIsMuted(!isMuted)}
    >
      <div className="flex items-center gap-3">
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Volume2 className="w-5 h-5 text-primary animate-pulse-glow" />
        )}
        
        {/* Audio Bars */}
        <div className="flex items-end gap-0.5 h-5">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-full transition-all duration-300 ${
                isMuted 
                  ? 'bg-muted-foreground h-1' 
                  : 'bg-primary'
              }`}
              style={{
                height: isMuted ? '4px' : `${Math.random() * 16 + 4}px`,
                animationDelay: `${bar * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioWidget;
