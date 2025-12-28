import React, { useState, useRef } from 'react';

const OutroSlide = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (limit to 20 degrees)
    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * 20;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <section className="section-slide bg-black noise relative overflow-hidden">
      {/* STARFIELD BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-[warp_3s_linear_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* CONTENT CONTAINER */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* THE 3D CARD */}
        <div
          ref={cardRef}
          className="relative z-10 w-[350px] h-[500px] rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-[0_0_50px_rgba(204,255,0,0.1)] transition-transform duration-100 ease-linear"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Neon Border Glow */}
          <div className="absolute inset-0 rounded-2xl border border-[#CCFF00]/30 pointer-events-none"></div>

          {/* Holographic Sheen */}
          <div
            className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
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
              <h3 className="text-sm font-mono text-gray-400 tracking-[0.2em]">SEASON PASS</h3>
              <h1 className="text-3xl font-black mt-2 italic">2024</h1>
            </div>

            {/* Card Stats */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase text-[#CCFF00] font-bold tracking-widest">
                  Player Rank
                </p>
                <p className="text-4xl font-black tracking-tighter drop-shadow-lg">
                  IRON ADDICT
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Total Load</p>
                  <p className="text-xl font-bold">158.4 T</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Sessions</p>
                  <p className="text-xl font-bold">142</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Top Lift</p>
                  <p className="text-xl font-bold">Deadlift</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Consistency</p>
                  <p className="text-xl font-bold text-[#CCFF00]">A+</p>
                </div>
              </div>
            </div>

            {/* Card Footer / Barcode */}
            <div className="border-t border-white/10 pt-4">
              <div className="h-8 w-full bg-white/10 rounded flex items-center justify-center opacity-50">
                <span className="font-mono text-[10px] tracking-[0.5em]">||| || ||| | ||</span>
              </div>
              <p className="text-center text-[10px] text-gray-500 mt-2 font-mono">
                ID: 8842-GRIND-2024
              </p>
            </div>
          </div>
        </div>

        {/* PULSING CTA */}
        <div className="mt-12 z-10 text-center">
          <p className="text-[#CCFF00] font-mono text-sm animate-pulse tracking-widest">
            SYSTEM READY. INITIALIZING 2025...
          </p>
        </div>
      </div>

      {/* CSS for warp animation */}
      <style>{`
        @keyframes warp {
          0% {
            transform: translateZ(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateZ(200px) scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default OutroSlide;

