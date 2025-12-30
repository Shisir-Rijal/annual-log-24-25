import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const OutroSlide_2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const ggRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GG Background Pulse Animation
      gsap.to(ggRef.current, {
        scale: 1.05,
        opacity: 0.08,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Content Staggered Fade-in
      gsap.fromTo(
        '.outro-content-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-slide bg-black noise relative overflow-hidden flex items-center justify-center h-screen w-full"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black z-0" />

      {/* GG Watermark */}
      <div
        ref={ggRef}
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none"
      >
        <span
          className="font-display font-black text-white uppercase"
          style={{
            fontSize: 'clamp(200px, 40vw, 500px)',
            opacity: 0.05,
            letterSpacing: '-0.05em',
          }}
        >
          GG
        </span>
      </div>

      {/* Foreground Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
      >
        {/* Status Indicator */}
        <div className="outro-content-item flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_10px_#CCFF00]" />
          <span className="font-mono text-xs text-gray-500 uppercase tracking-[0.2em]">
            System Standby
          </span>
        </div>

        {/* Main Title */}
        <h1 className="outro-content-item font-display font-black text-white uppercase tracking-tighter text-5xl md:text-7xl lg:text-8xl mb-4">
          Cycle Complete
        </h1>

        {/* Subtext */}
        <p className="outro-content-item font-mono text-sm md:text-base text-gray-400 max-w-md mb-6">
          Thank you for reviewing the 2024/2025 logs.
        </p>

        {/* Credits */}
        <p className="outro-content-item font-mono text-xs text-gray-600 mb-12">
          Semester Project by Shisir Bhattarai
        </p>

        {/* Replay Button */}
        <button
          onClick={handleReplay}
          className="outro-content-item group relative px-8 py-4 border border-white/20 rounded-lg font-mono text-sm uppercase tracking-widest text-gray-400 hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all duration-300"
        >
          <span className="relative z-10">Reinitiate System</span>
        </button>

        {/* Decorative Footer Line */}
        <div className="outro-content-item mt-16 flex items-center gap-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/20" />
          <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">
            v1.0.0
          </span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>
    </section>
  );
};

export default OutroSlide_2;
