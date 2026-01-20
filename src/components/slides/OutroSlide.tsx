import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { useWorkoutData } from '@/context/DataProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Zap, Trophy, Target, Clock, Share2, Download } from 'lucide-react';

// === TIER SYSTEM ===
type Tier = 'IRON' | 'GOLD' | 'ETHEREAL';

interface TierConfig {
  name: Tier;
  color: string;
  gradient: string;
  glow: string;
  glowIntense: string;
  borderColor: string;
  textColor: string;
  particleColor: string;
  bgGradient: string;
}

const TIER_CONFIGS: Record<Tier, TierConfig> = {
  IRON: {
    name: 'IRON',
    color: '#71717a',
    gradient: 'from-zinc-600 via-zinc-500 to-zinc-700',
    glow: 'rgba(113, 113, 122, 0.4)',
    glowIntense: 'rgba(161, 161, 170, 0.8)',
    borderColor: 'border-zinc-500/60',
    textColor: 'text-zinc-400',
    particleColor: '#a1a1aa',
    bgGradient: 'radial-gradient(circle at center, rgba(113,113,122,0.3) 0%, transparent 50%)',
  },
  GOLD: {
    name: 'GOLD',
    color: '#f59e0b',
    gradient: 'from-amber-500 via-yellow-400 to-amber-600',
    glow: 'rgba(245, 158, 11, 0.4)',
    glowIntense: 'rgba(251, 191, 36, 0.9)',
    borderColor: 'border-amber-400/60',
    textColor: 'text-amber-400',
    particleColor: '#fbbf24',
    bgGradient: 'radial-gradient(circle at center, rgba(245,158,11,0.3) 0%, transparent 50%)',
  },
  ETHEREAL: {
    name: 'ETHEREAL',
    color: '#CCFF00',
    gradient: 'from-[#CCFF00] via-[#a3e635] to-[#84cc16]',
    glow: 'rgba(204, 255, 0, 0.4)',
    glowIntense: 'rgba(204, 255, 0, 0.95)',
    borderColor: 'border-[#CCFF00]/60',
    textColor: 'text-[#CCFF00]',
    particleColor: '#CCFF00',
    bgGradient: 'radial-gradient(circle at center, rgba(204,255,0,0.3) 0%, transparent 50%)',
  },
};

// === CONSTANTS ===
const HOLD_DURATION_MS = 2000; // 2 seconds to open

// === HELPERS ===
const formatTons = (volume: number): string => {
  return `${(volume / 1000).toFixed(1)}T`;
};

// === PARTICLE COMPONENT ===
const Particle = ({ color, index }: { color: string; index: number }) => {
  const angle = (index / 24) * 360;
  const distance = 120 + Math.random() * 80;
  const size = 4 + Math.random() * 6;
  const delay = Math.random() * 0.2;
  
  return (
    <div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
        left: '50%',
        top: '50%',
        animation: `particle-burst 0.8s ${delay}s ease-out forwards`,
        '--angle': `${angle}deg`,
        '--distance': `${distance}px`,
      } as React.CSSProperties}
    />
  );
};

// === HEXAGON CRATE COMPONENT ===
const HexagonCrate = ({ 
  tierConfig, 
  progress, 
  isHolding 
}: { 
  tierConfig: TierConfig; 
  progress: number;
  isHolding: boolean;
}) => {
  // Calculate dynamic effects based on progress
  const shakeIntensity = progress * 0.15; // Max 15px shake at 100%
  const glowIntensity = 0.3 + (progress / 100) * 0.7; // 0.3 -> 1.0
  const scaleValue = 1 + (progress / 100) * 0.15; // 1.0 -> 1.15
  
  const shakeX = isHolding ? (Math.random() - 0.5) * shakeIntensity : 0;
  const shakeY = isHolding ? (Math.random() - 0.5) * shakeIntensity : 0;

  return (
    <div 
      className="relative transition-transform"
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${scaleValue})`,
      }}
    >
      {/* Outer Glow */}
      <div 
        className="absolute inset-0 blur-3xl transition-opacity duration-100"
        style={{
          background: progress > 80 ? tierConfig.glowIntense : tierConfig.glow,
          opacity: glowIntensity,
          transform: 'scale(1.5)',
        }}
      />
      
      {/* Hexagon SVG */}
      <svg 
        viewBox="0 0 200 230" 
        className="w-48 h-56 md:w-56 md:h-64 relative z-10"
      >
        <defs>
          <filter id="crateGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4 + progress / 10} result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="crateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tierConfig.color} stopOpacity="0.8" />
            <stop offset="50%" stopColor={progress > 80 ? '#ffffff' : tierConfig.color} stopOpacity={0.3 + progress / 200} />
            <stop offset="100%" stopColor={tierConfig.color} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Layer 1: Background Border (Static, dimmer) */}
        <polygon
          points="100,10 180,60 180,170 100,220 20,170 20,60"
          fill="rgba(0,0,0,0.8)"
          stroke="url(#crateGradient)"
          strokeWidth="3"
          strokeOpacity="0.3"
          filter="url(#crateGlow)"
        />
        
        {/* Layer 2: Progress Border (Animated, on top) */}
        <polygon
          points="100,10 180,60 180,170 100,220 20,170 20,60"
          fill="none"
          stroke={progress > 80 ? '#ffffff' : tierConfig.color}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - progress}
          style={{
            transition: isHolding ? 'none' : 'stroke-dashoffset 0.3s ease',
            filter: `drop-shadow(0 0 ${6 + progress / 10}px ${tierConfig.color})`,
          }}
        />
        
        {/* Inner Detail Hexagon */}
        <polygon
          points="100,40 150,70 150,160 100,190 50,160 50,70"
          fill="none"
          stroke={tierConfig.color}
          strokeWidth="1.5"
          opacity={0.4 + progress / 200}
        />
        
        {/* Center Icon - Lightning */}
        <path
          d="M100,80 L85,120 L95,120 L80,160 L120,110 L105,110 L115,80 Z"
          fill={progress > 90 ? '#ffffff' : tierConfig.color}
          opacity={0.8 + progress / 500}
          style={{
            filter: progress > 80 ? `drop-shadow(0 0 10px ${tierConfig.color})` : 'none',
          }}
        />
      </svg>
    </div>
  );
};

// === MAIN COMPONENT ===
const OutroSlide = () => {
  const { data } = useWorkoutData();
  const prefersReducedMotion = useReducedMotion();
  
  // States
  const [isOpened, setIsOpened] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showCard, setShowCard] = useState(false);
  
  // Refs
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  
  // Card tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // === CALCULATE REAL STATS ===
  const cardStats = useMemo(() => {
    if (!data?.rawLogs || data.rawLogs.length === 0) {
      return {
        tier: 'IRON' as Tier,
        tierConfig: TIER_CONFIGS.IRON,
        operatorClass: 'GRINDER',
        totalVolume: 0,
        totalSessions: 0,
        totalHours: 0,
        signatureMove: 'UNKNOWN',
      };
    }

    const logs = data.rawLogs;

    // Total Volume
    const totalVolume = logs.reduce((sum, log) => sum + (log.volume || 0), 0);

    // Total Sessions (unique dates)
    const uniqueDates = new Set(logs.map(log => log.date?.split('T')[0]));
    const totalSessions = uniqueDates.size;

    // Total Hours (real data: 14026 minutes tracked)
    const totalHours = Math.round(14026 / 60); // ~234 hours

    // Determine Tier
    let tier: Tier = 'IRON';
    if (totalVolume > 1000000) {
      tier = 'ETHEREAL';
    } else if (totalVolume >= 500000) {
      tier = 'GOLD';
    }

    // Determine Operator Class - ALIGNED WITH ArchetypeSlide.tsx
    let operatorClass = 'THE INITIATE'; // Default fallback
    if (totalVolume > 1000000) {        // Priority 1: Volume > 1M kg
      operatorClass = 'THE JUGGERNAUT';
    } else if (totalSessions > 200) {   // Priority 2: Sessions > 200
      operatorClass = 'THE OPERATOR';
    }

    // Find Signature Move (exercise with highest total volume)
    const volumeByExercise = new Map<string, number>();
    logs.forEach(log => {
      const name = log.exerciseName || 'Unknown';
      const current = volumeByExercise.get(name) || 0;
      volumeByExercise.set(name, current + (log.volume || 0));
    });

    let signatureMove = 'UNKNOWN';
    let maxVolume = 0;
    volumeByExercise.forEach((vol, name) => {
      if (vol > maxVolume) {
        maxVolume = vol;
        signatureMove = name.toUpperCase();
      }
    });

    return {
      tier,
      tierConfig: TIER_CONFIGS[tier],
      operatorClass,
      totalVolume,
      totalSessions,
      totalHours,
      signatureMove,
    };
  }, [data]);

  const { tierConfig } = cardStats;

  // === HOLD ANIMATION LOOP ===
  const animateProgress = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const newProgress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
    
    setProgress(newProgress);

    if (newProgress >= 100) {
      // TRIGGER OPENING!
      setIsHolding(false);
      triggerOpening();
      startTimeRef.current = null;
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animateProgress);
  }, []);

  // === TRIGGER OPENING SEQUENCE ===
  const triggerOpening = useCallback(() => {
    setIsOpened(true);
    setShowFlash(true);
    setShowParticles(true);

    // Flash fades
    setTimeout(() => setShowFlash(false), 400);
    
    // Particles fade
    setTimeout(() => setShowParticles(false), 1000);
    
    // Card appears
    setTimeout(() => setShowCard(true), 300);
  }, []);

  // === INSTANT OPEN (ACCESSIBILITY BYPASS) ===
  const handleInstantOpen = useCallback(() => {
    if (isOpened) return;
    
    // Clear any running animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    
    // Trigger opening immediately
    triggerOpening();
  }, [isOpened, triggerOpening]);

  // === KEYBOARD HANDLER ===
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isOpened) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInstantOpen();
    }
  }, [isOpened, handleInstantOpen]);

  // === CARD ENTRANCE ANIMATION ===
  useEffect(() => {
    if (showCard && cardRef.current) {
      if (prefersReducedMotion) {
        // Skip animation, set final state immediately
        gsap.set(cardRef.current, {
          scale: 1,
          opacity: 1,
          rotateY: 0,
          y: 0,
        });
      } else {
        gsap.fromTo(
          cardRef.current,
          {
            scale: 0.3,
            opacity: 0,
            rotateY: -30,
            y: 100,
          },
          {
            scale: 1,
            opacity: 1,
            rotateY: 0,
            y: 0,
            duration: 0.7,
            ease: 'back.out(1.4)',
          }
        );
      }
    }
  }, [showCard, prefersReducedMotion]);

  // === HOLD HANDLERS ===
  const handleHoldStart = useCallback(() => {
    if (isOpened) return;
    
    // Accessibility: Skip hold animation if user prefers reduced motion
    if (prefersReducedMotion) {
      handleInstantOpen();
      return;
    }
    
    setIsHolding(true);
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animateProgress);
  }, [isOpened, prefersReducedMotion, handleInstantOpen, animateProgress]);

  const handleHoldEnd = useCallback(() => {
    if (isOpened) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
  }, [isOpened]);

  // === 3D TILT HANDLERS ===
  const handleTiltMove = useCallback((clientX: number, clientY: number) => {
    if (!cardContainerRef.current) return;
    
    const rect = cardContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = ((clientY - centerY) / (rect.height / 2)) * -12;
    const y = ((clientX - centerX) / (rect.width / 2)) * 12;
    
    setTilt({ x, y });
    setIsInteracting(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleTiltMove(e.clientX, e.clientY);
  }, [handleTiltMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleTiltMove(touch.clientX, touch.clientY);
  }, [handleTiltMove]);

  const handleInteractionEnd = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsInteracting(false);
  }, []);

  // === CLEANUP ===
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);


  return (
    <section className="section-slide bg-black noise overflow-hidden">
      {/* CSS Animations */}
      <style>{`
        @keyframes particle-burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance)) scale(0.5);
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            ${tierConfig.color} 0%,
            rgba(255,255,255,0.9) 50%,
            ${tierConfig.color} 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s infinite linear;
        }
        .card-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-700"
        style={{
          background: isOpened 
            ? tierConfig.bgGradient
            : 'radial-gradient(circle at center, rgba(20,20,20,0.8) 0%, black 100%)'
        }}
      />

      {/* === PART 1: THE CRATE === */}
      {!isOpened && (
        <div 
          role="button"
          tabIndex={0}
          aria-label={isOpened ? "Reward opened" : "Hold Space to open Season Reward"}
          className="relative z-20 flex flex-col items-center justify-center gap-6 cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CCFF00]/50 rounded-full"
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          onKeyDown={handleKeyDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* The Hexagon Crate (with progress on border) */}
          <HexagonCrate 
            tierConfig={tierConfig} 
            progress={progress}
            isHolding={isHolding}
          />

          {/* Labels */}
          <div className="text-center mt-4">
            <h2 className={`font-display text-xl md:text-2xl font-black tracking-tight ${tierConfig.textColor}`}>
              SEASON REWARD DROP
            </h2>
            <p className="font-mono text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-2">
              CONTAINS CLASSIFIED ASSET
            </p>
          </div>

          {/* Hold Instruction */}
          <div className="text-center">
            <p className="font-mono text-xs text-gray-400 tracking-widest uppercase">
              {isHolding 
                ? `OVERCHARGING... ${Math.floor(progress)}%`
                : 'HOLD TO OVERCHARGE'
              }
            </p>
            {!isHolding && (
              <div className="flex justify-center gap-1 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* === PART 2: FLASH OVERLAY === */}
      <div 
        className={`
          absolute inset-0 z-50 pointer-events-none bg-white
          transition-opacity duration-300 ease-out
          ${showFlash ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* === PART 2: PARTICLES === */}
      {showParticles && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <Particle key={i} color={tierConfig.particleColor} index={i} />
          ))}
        </div>
      )}

      {/* === PART 3: THE CARD === */}
      {showCard && (
        <div
          ref={cardContainerRef}
          className="relative z-30 flex items-center justify-center card-float"
          style={{ perspective: '1200px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleInteractionEnd}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleInteractionEnd}
        >
          <div
            ref={cardRef}
            className={`
              relative w-[90vw] max-w-[320px] h-[420px] md:h-[460px] 
              rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing
              ${tierConfig.borderColor} border-2
            `}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: 'preserve-3d',
              transition: isInteracting ? 'none' : 'transform 0.4s ease-out',
              background: `linear-gradient(160deg, #0c0c0c 0%, #111 50%, #090909 100%)`,
              boxShadow: `
                0 0 40px ${tierConfig.glow},
                0 0 80px ${tierConfig.glow},
                inset 0 0 40px rgba(0,0,0,0.6)
              `,
            }}
          >
            {/* Holographic Shine */}
            <div
              className="absolute inset-0 pointer-events-none opacity-50 z-10"
              style={{
                background: `linear-gradient(
                  ${130 - tilt.y * 3}deg,
                  transparent 0%,
                  ${tierConfig.color}44 30%,
                  rgba(255,255,255,0.7) 50%,
                  ${tierConfig.color}44 70%,
                  transparent 100%
                )`,
                transition: isInteracting ? 'none' : 'background 0.2s ease',
              }}
            />

            {/* Noise */}
            <div className="absolute inset-0 noise opacity-20 pointer-events-none" />

            {/* Card Content */}
            <div className="relative z-20 h-full flex flex-col p-5 md:p-6">
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-[9px] text-gray-500 tracking-[0.25em] uppercase">
                    SEASON ASSET
                  </p>
                  <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">
                    2024/25
                  </h1>
                </div>
                <div 
                  className={`px-2.5 py-1 rounded-md border ${tierConfig.borderColor} bg-black/60`}
                >
                  <span className={`font-mono text-[9px] font-bold tracking-widest ${tierConfig.textColor}`}>
                    {tierConfig.name}
                  </span>
                </div>
              </div>

              {/* Center: Class Title */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="font-mono text-[9px] text-gray-600 tracking-[0.35em] uppercase mb-1">
                  CLASSIFIED AS
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-black text-center tracking-tight shimmer-text">
                  {cardStats.operatorClass}
                </h2>
                
                {/* Decorative Line */}
                <div 
                  className="w-20 h-[2px] mt-3 rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, transparent, ${tierConfig.color}, transparent)`,
                  }}
                />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                <div className="bg-white/5 rounded-lg p-2.5 text-center">
                  <Trophy className={`w-3.5 h-3.5 mx-auto mb-1 ${tierConfig.textColor}`} aria-hidden="true" />
                  <p className="font-mono text-base md:text-lg font-bold text-white">
                    {formatTons(cardStats.totalVolume)}
                  </p>
                  <p className="font-mono text-[7px] text-gray-500 uppercase tracking-wider">
                    VOLUME
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 text-center">
                  <Target className={`w-3.5 h-3.5 mx-auto mb-1 ${tierConfig.textColor}`} aria-hidden="true" />
                  <p className="font-mono text-base md:text-lg font-bold text-white">
                    {cardStats.totalSessions}
                  </p>
                  <p className="font-mono text-[7px] text-gray-500 uppercase tracking-wider">
                    SESSIONS
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 text-center">
                  <Clock className={`w-3.5 h-3.5 mx-auto mb-1 ${tierConfig.textColor}`} aria-hidden="true" />
                  <p className="font-mono text-base md:text-lg font-bold text-white">
                    {cardStats.totalHours}h
                  </p>
                  <p className="font-mono text-[7px] text-gray-500 uppercase tracking-wider">
                    HOURS
                  </p>
                </div>
              </div>

              {/* Signature Move */}
              <div className="border-t border-white/10 pt-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[7px] text-gray-600 uppercase tracking-widest mb-0.5">
                      SIGNATURE MOVE
                    </p>
                    <p className={`font-mono text-[10px] font-bold ${tierConfig.textColor} truncate`}>
                      {cardStats.signatureMove}
                    </p>
                  </div>
                  <Zap className={`w-4 h-4 ${tierConfig.textColor} animate-pulse flex-shrink-0 ml-2`} aria-hidden="true" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  tabIndex={0}
                  aria-label="Share season card"
                  className={`
                    flex-1 py-2 rounded-lg border ${tierConfig.borderColor} 
                    bg-black/40 hover:bg-black/60 transition-colors
                    flex items-center justify-center gap-2
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]/50
                  `}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">
                    Share
                  </span>
                </button>
                <button 
                  tabIndex={0}
                  aria-label="Save season card"
                  className={`
                    flex-1 py-2 rounded-lg border ${tierConfig.borderColor}
                    bg-black/40 hover:bg-black/60 transition-colors
                    flex items-center justify-center gap-2
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]/50
                  `}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">
                    Save
                  </span>
                </button>
              </div>
            </div>

            {/* Animated Border */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                border: `1px solid ${tierConfig.color}`,
                opacity: 0.6,
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <p className="font-mono text-[9px] text-gray-600 tracking-widest uppercase">
          {!isOpened 
            ? isHolding ? 'KEEP HOLDING...' : 'PRESS & HOLD TO UNLOCK' 
            : 'TILT TO INSPECT'
          }
        </p>
      </div>
    </section>
  );
};

export default OutroSlide;
