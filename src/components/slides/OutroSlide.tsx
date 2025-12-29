import React, { useState, useRef } from 'react';
import { Lock, Zap } from 'lucide-react';

const OutroSlide = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Card Tilt Logic
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleCardMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * 20;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleBoxClick = () => {
    if (clickCount >= 3) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Trigger explosion on 3rd click
    if (newCount === 3) {
      setIsExploding(true);
      setTimeout(() => {
        setShowCard(true);
      }, 800); // Wait for white flash to peak
    }
  };

  // Dynamic styles based on clicks
  const getBoxStyle = () => {
    if (clickCount === 0) return "scale-100 shadow-[0_0_20px_#CCFF00]";
    if (clickCount === 1) return "scale-110 shadow-[0_0_40px_yellow] animate-shake-mild";
    if (clickCount === 2) return "scale-125 shadow-[0_0_80px_orange] animate-shake-hard";
    return "scale-0 opacity-0"; // Exploded
  };

  return (
    <section className="section-slide bg-black noise relative overflow-hidden flex items-center justify-center">
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black"></div>
      </div>

      {/* --- PHASE 1: THE LOOT BOX --- */}
      {!showCard && (
        <div className="z-20 flex flex-col items-center gap-8 transition-all duration-300">
          {/* The Box / Vault */}
          <div
            onClick={handleBoxClick}
            className={`
              w-48 h-48 bg-black/80 border-2 border-[#CCFF00] rounded-2xl 
              flex items-center justify-center cursor-pointer select-none
              transition-all duration-200 active:scale-95
              ${getBoxStyle()}
              ${isExploding ? 'animate-ping duration-700' : ''}
            `}
          >
            {clickCount < 2 ? (
              <Lock
                size={64}
                className={`text-white transition-all ${clickCount > 0 ? 'text-yellow-400' : ''}`}
              />
            ) : (
              <Zap size={64} className="text-red-500 animate-pulse" />
            )}
          </div>

          {/* Progress / Instructions */}
          <div
            className={`text-center transition-opacity duration-500 ${
              isExploding ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <h2 className="text-2xl font-black text-white tracking-widest mb-4">
              {clickCount === 0 && 'SECURE STORAGE'}
              {clickCount === 1 && 'DECRYPTING...'}
              {clickCount === 2 && 'SYSTEM FAILURE WARNING!'}
            </h2>

            {/* Health Bar */}
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-[#CCFF00] transition-all duration-300 ease-out"
                style={{
                  width: `${(clickCount / 3) * 100}%`,
                  backgroundColor: clickCount === 2 ? 'red' : '#CCFF00'
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              TAP TO BREAK SEAL ({clickCount}/3)
            </p>
          </div>
        </div>
      )}

      {/* --- TRANSITION: WHITE FLASH OVERLAY --- */}
      <div
        className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-1000 ease-out ${
          isExploding && !showCard ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>

      {/* --- PHASE 2: THE REWARD CARD --- */}
      {showCard && (
        <div
          className="animate-[zoomIn_0.8s_ease-out] z-40"
          style={{ perspective: '1000px' }}
          onMouseMove={handleCardMove}
          onMouseLeave={() => setRotate({ x: 0, y: 0 })}
        >
          <div
            ref={cardRef}
            className="relative w-[350px] h-[500px] rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-[0_0_50px_rgba(204,255,0,0.2)] transition-transform duration-100 ease-linear"
            style={{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Neon Border Glow */}
            <div className="absolute inset-0 rounded-2xl border border-[#CCFF00]/50 pointer-events-none animate-pulse"></div>

            {/* Holographic Shine Effect */}
            <div
              className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
              style={{
                background: `linear-gradient(
                  ${135 + rotate.y}deg,
                  transparent 0%,
                  rgba(204, 255, 0, 0.3) 45%,
                  rgba(255, 255, 255, 0.5) 50%,
                  rgba(204, 255, 0, 0.3) 55%,
                  transparent 100%
                )`
              }}
            />

            <div className="h-full flex flex-col justify-between p-8 text-white select-none">
              {/* Card Header */}
              <div className="text-center border-b border-white/10 pb-4">
                <h3 className="text-sm font-mono text-[#CCFF00] tracking-[0.2em]">
                  SEASON REWARD
                </h3>
                <h1 className="text-4xl font-black mt-2 italic drop-shadow-md">2024</h1>
              </div>

              {/* Card Stats */}
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase text-[#CCFF00] font-bold tracking-widest">
                    Rank Achieved
                  </p>
                  <p className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                    ELITE
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase">Volume</p>
                    <p className="text-xl font-bold">158.4 T</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase">Consistency</p>
                    <p className="text-xl font-bold text-[#CCFF00]">98%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase">Sessions</p>
                    <p className="text-xl font-bold">142</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase">Top Lift</p>
                    <p className="text-xl font-bold">Deadlift</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 pt-4 text-center">
                <div className="h-8 w-full bg-white/10 rounded flex items-center justify-center opacity-50 mb-2">
                  <span className="font-mono text-[10px] tracking-[0.5em]">||| || ||| | ||</span>
                </div>
                <p className="text-[#CCFF00] font-mono text-xs animate-pulse">
                  {'>> INITIALIZING SEASON 2025...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes shake-mild {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes shake-hard {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake-mild { animation: shake-mild 0.3s infinite; }
        .animate-shake-hard { animation: shake-hard 0.1s infinite; }
        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default OutroSlide;
