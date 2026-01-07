import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useAudio } from '@/context/AudioProvider';

const OutroSlide_2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const echoGridRef = useRef<HTMLDivElement>(null);
  const { stopBGM } = useAudio();

  const handleReinitiate = () => {
    // Stop the background music
    stopBGM();
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ============================================
      // BACKGROUND: Echo Grid Pulse Animation
      // Simulates a dying monitor signal
      // ============================================
      if (echoGridRef.current) {
        gsap.to(echoGridRef.current, {
          scale: 1.02,
          opacity: 0.08,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // ============================================
      // FOREGROUND: Simple fade-in on mount
      // No ScrollTrigger to avoid scroller conflicts
      // ============================================
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 0.3,
          }
        );
      }

      // Staggered animation for individual content items
      gsap.fromTo(
        '.shutdown-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.5,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-slide bg-black"
    >
      {/* ============================================
          LAYER 1: Base Gradient
          ============================================ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black z-0" />

      {/* ============================================
          LAYER 2: Noise Texture Overlay
          ============================================ */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* ============================================
          LAYER 3: Echo Grid (Dying Monitor Signal)
          ============================================ */}
      <div
        ref={echoGridRef}
        className="absolute inset-0 z-5 pointer-events-none flex items-center justify-center opacity-[0.05]"
      >
        {/* Concentric rings / grid pattern */}
        <div className="relative w-[600px] h-[600px]">
          {/* Ring 1 */}
          <div className="absolute inset-0 border border-white/30 rounded-full" />
          {/* Ring 2 */}
          <div className="absolute inset-[15%] border border-white/25 rounded-full" />
          {/* Ring 3 */}
          <div className="absolute inset-[30%] border border-white/20 rounded-full" />
          {/* Ring 4 */}
          <div className="absolute inset-[45%] border border-white/15 rounded-full" />
          {/* Center dot */}
          <div className="absolute inset-[48%] bg-white/10 rounded-full" />
          
          {/* Crosshair lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      {/* ============================================
          FOREGROUND CONTENT (z-20)
          ============================================ */}
      <div
        ref={contentRef}
        className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6"
      >
        {/* Status Indicator */}
        <div className="shutdown-item flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_10px_#CCFF00]" />
          <span className="font-mono text-xs text-gray-500 uppercase tracking-[0.2em]">
            System Standby
          </span>
        </div>

        {/* Main Title */}
        <h1 className="shutdown-item font-display font-black text-white uppercase tracking-tighter text-5xl md:text-7xl lg:text-8xl mb-4">
          Cycle Complete
        </h1>

        {/* Subtext */}
        <p className="shutdown-item font-mono text-sm md:text-base text-gray-400 max-w-md mb-6">
          Thank you for reviewing the 2024/2025 logs.
        </p>

        {/* Credits */}
        <p className="shutdown-item font-mono text-xs text-gray-600 mb-12">
          Semester Project by Shisir Bhattarai
        </p>

        {/* Reinitiate Button */}
        <button
          onClick={handleReinitiate}
          className="shutdown-item group relative px-8 py-4 border border-white/20 rounded-lg font-mono text-sm uppercase tracking-widest text-gray-400 hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all duration-300"
        >
          <span className="relative z-10">Reinitiate System</span>
        </button>

        {/* Decorative Footer Line */}
        <div className="shutdown-item mt-16 flex items-center gap-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/20" />
          <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">
            v1.0.0
          </span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>

      {/* ============================================
          SCANLINE EFFECT (Optional subtle CRT feel)
          ============================================ */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />
    </section>
  );
};

export default OutroSlide_2;
