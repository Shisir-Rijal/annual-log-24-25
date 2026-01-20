import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Fingerprint, Lock, Shield, Zap } from 'lucide-react';
import { useWorkoutData } from '@/context/DataProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Constants
const SCAN_DURATION_MS = 3000; // 3 seconds to complete scan

// Helper: Calculate 1RM (Epley Formula)
const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  return weight * (1 + reps / 30);
};

// Helper: Get progress color based on percentage
const getProgressColor = (progress: number): string => {
  if (progress < 50) return '#ef4444'; // Red
  if (progress < 90) return '#f97316'; // Orange
  return '#00ffcc'; // Cyan/Green
};

// Helper: Get glow color based on percentage
const getGlowColor = (progress: number): string => {
  if (progress < 50) return 'rgba(239, 68, 68, 0.4)'; // Red glow
  if (progress < 90) return 'rgba(249, 115, 22, 0.4)'; // Orange glow
  return 'rgba(0, 255, 204, 0.6)'; // Cyan glow
};

// Geometric Glyph Components
const HexagonGlyph = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28">
    <defs>
      <filter id="hexGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <polygon
      points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
      fill="none"
      stroke="#CCFF00"
      strokeWidth="3"
      filter="url(#hexGlow)"
      className="animate-pulse"
      style={{ animationDuration: '3s' }}
    />
    <polygon
      points="50,20 78,35 78,65 50,80 22,65 22,35"
      fill="rgba(204,255,0,0.1)"
      stroke="#CCFF00"
      strokeWidth="1.5"
      opacity="0.6"
    />
  </svg>
);

const CrosshairGlyph = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28">
    <defs>
      <filter id="crosshairGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer circle */}
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="none"
      stroke="#CCFF00"
      strokeWidth="2.5"
      filter="url(#crosshairGlow)"
    />
    {/* Inner circle */}
    <circle
      cx="50"
      cy="50"
      r="20"
      fill="rgba(204,255,0,0.05)"
      stroke="#CCFF00"
      strokeWidth="1.5"
      opacity="0.7"
    />
    {/* Crosshair ticks */}
    <line x1="50" y1="5" x2="50" y2="25" stroke="#CCFF00" strokeWidth="2" filter="url(#crosshairGlow)" />
    <line x1="50" y1="75" x2="50" y2="95" stroke="#CCFF00" strokeWidth="2" filter="url(#crosshairGlow)" />
    <line x1="5" y1="50" x2="25" y2="50" stroke="#CCFF00" strokeWidth="2" filter="url(#crosshairGlow)" />
    <line x1="75" y1="50" x2="95" y2="50" stroke="#CCFF00" strokeWidth="2" filter="url(#crosshairGlow)" />
    {/* Center dot */}
    <circle cx="50" cy="50" r="3" fill="#CCFF00" filter="url(#crosshairGlow)" />
  </svg>
);

const TriangleGlyph = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28">
    <defs>
      <filter id="triangleGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="triangleFill" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="rgba(204,255,0,0.2)" />
        <stop offset="100%" stopColor="rgba(204,255,0,0)" />
      </linearGradient>
    </defs>
    {/* Outer triangle */}
    <polygon
      points="50,8 92,85 8,85"
      fill="url(#triangleFill)"
      stroke="#CCFF00"
      strokeWidth="3"
      filter="url(#triangleGlow)"
    />
    {/* Inner triangle */}
    <polygon
      points="50,30 75,72 25,72"
      fill="none"
      stroke="#CCFF00"
      strokeWidth="1.5"
      opacity="0.5"
    />
    {/* Arrow tip accent */}
    <line x1="50" y1="8" x2="50" y2="25" stroke="#CCFF00" strokeWidth="2" opacity="0.8" />
  </svg>
);

const ArchetypeSlide = () => {
  const { data } = useWorkoutData();
  const prefersReducedMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Refs for requestAnimationFrame
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calculate dynamic RPG stats from workout data
  const rpgStats = useMemo(() => {
    if (!data?.rawLogs || data.rawLogs.length === 0) {
      return {
        level: 1,
        className: 'THE INITIATE',
        subtitle: 'RISING PROSPECT',
        classType: 'initiate' as const,
        str: 10,
        vit: 10,
        xp: 10,
        totalVolume: 0,
        totalSessions: 0,
      };
    }

    const logs = data.rawLogs;

    // Total Volume
    const totalVolume = logs.reduce((sum, log) => sum + (log.volume || 0), 0);

    // Total Sessions (unique dates)
    const uniqueDates = new Set(logs.map(log => log.date?.split('T')[0]));
    const totalSessions = uniqueDates.size;

    // Max 1RM across all exercises
    let max1RM = 0;
    logs.forEach(log => {
      const rm = calculate1RM(log.weight || 0, log.reps || 0);
      if (rm > max1RM) max1RM = rm;
    });

    // Calculate Level: floor(totalVolume / 20000)
    const level = Math.max(1, Math.floor(totalVolume / 20000));

    // Determine Class
    let className = 'THE INITIATE';
    let subtitle = 'RISING PROSPECT';
    let classType: 'juggernaut' | 'operator' | 'initiate' = 'initiate';

    if (totalVolume > 1000000) { // 1M kg
      className = 'THE JUGGERNAUT';
      subtitle = 'UNSTOPPABLE FORCE';
      classType = 'juggernaut';
    } else if (totalSessions > 200) {
      className = 'THE OPERATOR';
      subtitle = 'RELENTLESS CONSISTENCY';
      classType = 'operator';
    }

    // RPG Stats (0-100 Scale) - ELITE DIFFICULTY
    // STR: Max 1RM normalized (160kg = 100%)
    const str = Math.min(100, Math.round((max1RM / 160) * 100));
    // VIT: Sessions normalized (260 sessions = 100%)
    const vit = Math.min(100, Math.round((totalSessions / 260) * 100));
    // XP: Total Volume normalized (1.5M kg = 100%)
    const xp = Math.min(100, Math.round((totalVolume / 1500000) * 100));

    return {
      level,
      className,
      subtitle,
      classType,
      str,
      vit,
      xp,
      totalVolume,
      totalSessions,
    };
  }, [data]);

  // Animation loop for hold progress
  const animateProgress = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const newProgress = Math.min(100, (elapsed / SCAN_DURATION_MS) * 100);
    
    setProgress(newProgress);

    if (newProgress >= 100) {
      // Scan complete - trigger reveal
      setIsHolding(false);
      setIsRevealed(true);
      startTimeRef.current = null;
      return;
    }

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animateProgress);
  }, []);

  // Instant reveal handler (for reduced motion and keyboard)
  const handleInstantReveal = useCallback(() => {
    // Guard: Once revealed, card stays revealed
    if (isRevealed) return;

    // Clear any running animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsHolding(false);
    setProgress(100);
    setIsRevealed(true);
    startTimeRef.current = null;
  }, [isRevealed]);

  // Keyboard handler (Enter/Space)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Guard: Once revealed, do nothing
    if (isRevealed) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent scrolling on Space
      handleInstantReveal();
    }
  }, [isRevealed, handleInstantReveal]);

  // Start hold - ONE WAY ONLY (cannot un-flip once revealed)
  const handleHoldStart = useCallback(() => {
    // Guard: Once revealed, card stays revealed
    if (isRevealed) return;

    // Reduced Motion Bypass: Reveal instantly
    if (prefersReducedMotion) {
      handleInstantReveal();
      return;
    }

    setIsHolding(true);
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animateProgress);
  }, [isRevealed, animateProgress, prefersReducedMotion, handleInstantReveal]);

  // End hold
  const handleHoldEnd = useCallback(() => {
    // Guard: Once revealed, do nothing
    if (isRevealed) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
  }, [isRevealed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // SVG Progress Circle calculations
  const circleRadius = 52;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progressOffset = circleCircumference - (progress / 100) * circleCircumference;
  const progressColor = getProgressColor(progress);
  const glowColor = getGlowColor(progress);

  return (
    <section className="section-slide bg-gradient-slide-10 noise">
      {/* Custom CSS for shake animation */}
      <style>{`
        @keyframes biometric-shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1px, -1px); }
          20% { transform: translate(1px, 0); }
          30% { transform: translate(-1px, 1px); }
          40% { transform: translate(1px, -1px); }
          50% { transform: translate(-1px, 0); }
          60% { transform: translate(1px, 1px); }
          70% { transform: translate(0, -1px); }
          80% { transform: translate(-1px, 1px); }
          90% { transform: translate(1px, 0); }
        }
        .biometric-shake {
          animation: biometric-shake 0.1s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .biometric-shake {
            animation: none !important;
          }
        }
      `}</style>

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
          className={`
            relative w-80 h-[450px] select-none 
            ${isRevealed ? 'cursor-default' : 'cursor-pointer'}
            focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CCFF00]/50 rounded-2xl
          `}
          style={{ perspective: '1000px' }}
          tabIndex={0}
          role="button"
          aria-label={isRevealed ? 'Identity revealed' : 'Hold to scan identity, or press Space to reveal instantly'}
          aria-pressed={isRevealed}
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          <div 
            className={`
              relative w-full h-full 
              ${prefersReducedMotion ? '' : 'transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]'}
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
                {/* Fingerprint Scanner with SVG Progress Ring - Unified Wrapper */}
                <div className="relative w-28 h-28 mb-8">
                  {/* Glow background - absolute overlay */}
                  <div 
                    className="absolute inset-0 rounded-full blur-xl transition-all duration-150 pointer-events-none"
                    style={{ 
                      backgroundColor: isHolding ? glowColor : 'rgba(239, 68, 68, 0.2)',
                      transform: `scale(${1 + progress / 200})`
                    }}
                  />
                  
                  {/* SVG Progress Ring - absolute overlay covering exact wrapper bounds */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 112 112"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r={circleRadius}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r={circleRadius}
                      fill="none"
                      stroke={progressColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={progressOffset}
                      transform="rotate(-90 56 56)"
                      style={{
                        transition: isHolding ? 'none' : 'stroke-dashoffset 0.3s ease',
                        filter: `drop-shadow(0 0 8px ${progressColor})`
                      }}
                    />
                  </svg>

                  {/* Fingerprint container - centered in the same wrapper */}
                  <div 
                    className={`
                      absolute inset-0 flex items-center justify-center
                      ${isHolding ? 'biometric-shake' : ''}
                    `}
                  >
                    <div 
                      className="w-24 h-24 border-2 rounded-full flex items-center justify-center transition-colors duration-150"
                      style={{ 
                        borderColor: isHolding ? progressColor : 'rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <Fingerprint 
                        className="w-12 h-12 transition-colors duration-150"
                        style={{ 
                          color: isHolding ? progressColor : 'rgba(239, 68, 68, 0.8)'
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <p className="font-mono text-xs text-gray-500 tracking-[0.3em] uppercase">
                    {isHolding 
                      ? `SCANNING... ${Math.floor(progress)}%` 
                      : 'HOLD TO SCAN BIOMETRICS'
                    }
                  </p>
                  {!isHolding && (
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>

                {/* Glitch title */}
                <div className="mt-12 relative">
                  <h3 
                    className="font-mono text-lg text-gray-400 tracking-widest uppercase"
                    style={{
                      textShadow: isHolding 
                        ? `2px 0 ${progressColor}, -2px 0 ${progressColor}`
                        : '2px 0 #ff0000, -2px 0 #00ff00'
                    }}
                  >
                    IDENTITY ENCRYPTED
                  </h3>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="absolute bottom-8 flex flex-col items-center">
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4" />
                <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase">
                  {isHolding ? 'KEEP HOLDING...' : 'PRESS & HOLD'}
                </p>
              </div>

              {/* Border glow */}
              <div 
                className="absolute inset-0 rounded-2xl border transition-colors duration-150"
                style={{ 
                  borderColor: isHolding 
                    ? `${progressColor}40` 
                    : 'rgba(239, 68, 68, 0.2)'
                }}
              />
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
                      SEASON OF GRIND // 2024/25
                    </p>
                    <p className="font-mono text-xs text-gray-500 mt-1">
                      OPERATOR ID: #GR1ND-{String(rpgStats.totalSessions).padStart(4, '0')}
                    </p>
                  </div>
                  {/* Level Badge */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded bg-[#CCFF00]/20 border border-[#CCFF00]/40">
                      <span className="font-mono text-xs text-[#CCFF00] font-bold">
                        LVL {rpgStats.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
                {/* Geometric Class Glyph */}
                <div className="relative mb-4">
                  {rpgStats.classType === 'juggernaut' && <HexagonGlyph />}
                  {rpgStats.classType === 'operator' && <CrosshairGlyph />}
                  {rpgStats.classType === 'initiate' && <TriangleGlyph />}
                </div>

                {/* Title */}
                <h2 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight text-center">
                  {rpgStats.className}
                </h2>
                <p className="font-mono text-[10px] text-gray-500 mt-2 tracking-widest uppercase">
                  {rpgStats.subtitle}
                </p>

                {/* Quick Stats Summary */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#CCFF00]" />
                    <span className="font-mono text-[10px] text-gray-400">
                      {(rpgStats.totalVolume / 1000).toFixed(0)}K KG
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-gray-700 rounded-full" />
                  <span className="font-mono text-[10px] text-gray-400">
                    {rpgStats.totalSessions} SESSIONS
                  </span>
                </div>
              </div>

              {/* Stats Section */}
              <div className="relative z-10 p-6 border-t border-[#CCFF00]/20 space-y-3">
                <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase mb-4">
                  OPERATOR ATTRIBUTES
                </p>
                
                {/* STR - Strength (Max 1RM) */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-10">STR</span>
                  <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full transition-all duration-1000"
                      style={{ width: isRevealed ? `${rpgStats.str}%` : '0%' }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#CCFF00] w-10 text-right">{rpgStats.str}</span>
                </div>

                {/* VIT - Vitality (Sessions) */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-10">VIT</span>
                  <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full transition-all duration-1000 delay-100"
                      style={{ width: isRevealed ? `${rpgStats.vit}%` : '0%' }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#CCFF00] w-10 text-right">{rpgStats.vit}</span>
                </div>

                {/* XP - Experience (Total Volume) */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-10">XP</span>
                  <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full transition-all duration-1000 delay-200"
                      style={{ width: isRevealed ? `${rpgStats.xp}%` : '0%' }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#CCFF00] w-10 text-right">{rpgStats.xp}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 px-6 py-4 bg-black/50 flex items-center justify-between">
                <div className="flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 ${i % 2 === 0 ? 'h-4' : 'h-3'} bg-[#CCFF00]/30`}
                    />
                  ))}
                </div>
                <p className="font-mono text-[8px] text-[#CCFF00]/60 tracking-wider uppercase">
                  ID VERIFIED // ACCESS GRANTED
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="font-mono text-[10px] text-gray-700 mt-8 tracking-widest uppercase">
          {isRevealed ? 'IDENTITY CONFIRMED' : isHolding ? 'AUTHENTICATING...' : 'AUTHENTICATION REQUIRED'}
        </p>
      </div>
    </section>
  );
};

export default ArchetypeSlide;
