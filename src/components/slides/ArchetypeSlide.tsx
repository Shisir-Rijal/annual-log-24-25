import { useState } from 'react';
import { Fingerprint, Lock, Shield } from 'lucide-react';

const ArchetypeSlide = () => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Hardcoded stats (can be dynamic later)
  const stats = {
    str: 94,
    con: 87,
    vol: 91,
  };

  return (
    <section className="section-slide bg-gradient-slide-10 noise">
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Pre-title */}
        <p className="font-mono text-xs text-gray-600 tracking-[0.4em] uppercase mb-6">
          OPERATOR IDENTITY
        </p>

        {/* 3D Flip Card Container */}
        <div 
          className="relative w-80 h-[450px] cursor-pointer perspective-1000"
          onClick={() => setIsRevealed(!isRevealed)}
          style={{ perspective: '1000px' }}
        >
          <div 
            className={`
              relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${isRevealed ? '[transform:rotateY(180deg)]' : ''}
            `}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* === FRONT (LOCKED STATE) === */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl overflow-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(145deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)'
              }}
            >
              {/* Heavy noise overlay */}
              <div className="absolute inset-0 noise opacity-50" />
              
              {/* Scanlines effect */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                }}
              />

              {/* Top corner classified label */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Lock className="w-3 h-3 text-red-500" />
                <span className="font-mono text-[10px] text-red-500 tracking-widest animate-pulse">
                  CLASSIFIED
                </span>
              </div>

              {/* Shield icon / Status */}
              <div className="absolute top-4 right-4">
                <Shield className="w-4 h-4 text-gray-700" />
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Fingerprint Scanner */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 border-2 border-red-500/40 rounded-full flex items-center justify-center">
                    <Fingerprint className="w-12 h-12 text-red-500/80 animate-pulse" />
                  </div>
                  {/* Scanning ring */}
                  <div 
                    className="absolute inset-0 border-2 border-red-500/30 rounded-full animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <p className="font-mono text-xs text-gray-500 tracking-[0.3em] uppercase">
                    ANALYZING WORKOUT DATA
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>

                {/* Glitch title */}
                <div className="mt-12 relative">
                  <h3 
                    className="font-mono text-lg text-gray-400 tracking-widest uppercase"
                    style={{
                      textShadow: '2px 0 #ff0000, -2px 0 #00ff00'
                    }}
                  >
                    IDENTITY LOCKED
                  </h3>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="absolute bottom-8 flex flex-col items-center">
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4" />
                <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase">
                  TAP TO DECRYPT
                </p>
              </div>

              {/* Border glow */}
              <div className="absolute inset-0 rounded-2xl border border-red-500/20" />
            </div>

            {/* === BACK (REVEALED STATE) === */}
            <div 
              className="absolute inset-0 flex flex-col rounded-2xl overflow-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(165deg, #0d0d0d 0%, #0a0a0a 100%)'
              }}
            >
              {/* Neon border glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.3),inset_0_0_30px_rgba(204,255,0,0.05)]" />
              
              {/* Noise */}
              <div className="absolute inset-0 noise opacity-30" />

              {/* Header */}
              <div className="relative z-10 p-6 border-b border-[#CCFF00]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] text-[#CCFF00]/60 tracking-widest">
                      SEASON OF GRIND // 2024
                    </p>
                    <p className="font-mono text-xs text-gray-500 mt-1">
                      OPERATOR ID: #GR1ND-7749
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#CCFF00] flex items-center justify-center">
                    <span className="font-display text-xl font-black text-black">G</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
                {/* Giant Letter */}
                <div className="relative mb-4">
                  <span 
                    className="font-display text-[120px] font-black leading-none text-transparent"
                    style={{
                      WebkitTextStroke: '2px rgba(204,255,0,0.3)',
                      textShadow: '0 0 60px rgba(204,255,0,0.2)'
                    }}
                  >
                    G
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[80px] font-black text-[#CCFF00] leading-none">
                      G
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-display text-3xl font-black text-white tracking-tight text-center">
                  THE GRINDER
                </h2>
                <p className="font-mono text-xs text-gray-500 mt-2 tracking-widest uppercase">
                  RELENTLESS • CONSISTENT • IRON WILL
                </p>
              </div>

              {/* Stats Section */}
              <div className="relative z-10 p-6 border-t border-[#CCFF00]/20 space-y-3">
                <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase mb-4">
                  PERFORMANCE METRICS
                </p>
                
                {/* STR */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-10">STR</span>
                  <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full"
                      style={{ width: `${stats.str}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#CCFF00] w-10 text-right">{stats.str}%</span>
                </div>

                {/* CON */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-10">CON</span>
                  <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full"
                      style={{ width: `${stats.con}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#CCFF00] w-10 text-right">{stats.con}%</span>
                </div>

                {/* VOL */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-10">VOL</span>
                  <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full"
                      style={{ width: `${stats.vol}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#CCFF00] w-10 text-right">{stats.vol}%</span>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 px-6 py-4 bg-black/50 flex items-center justify-between">
                <div className="flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 ${i % 2 === 0 ? 'h-4' : 'h-3'} bg-gray-700`}
                    />
                  ))}
                </div>
                <p className="font-mono text-[8px] text-gray-600 tracking-wider">
                  VERIFIED ATHLETE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tap hint */}
        <p className="font-mono text-[10px] text-gray-700 mt-8 tracking-widest uppercase">
          {isRevealed ? 'TAP TO LOCK' : 'AUTHENTICATION REQUIRED'}
        </p>
      </div>
    </section>
  );
};

export default ArchetypeSlide;
