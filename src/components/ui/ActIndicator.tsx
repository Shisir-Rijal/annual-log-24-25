import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getActForSlide, Act } from '@/config/acts';
import { useAudio } from '@/context/AudioProvider';

interface ActIndicatorProps {
  currentSlideIndex: number;
}


const ActIndicator = ({ currentSlideIndex }: ActIndicatorProps) => {
  const { playSFX } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  
  const [currentAct, setCurrentAct] = useState<Act | null>(null);
  const previousActRef = useRef<Act | null>(null);

  // Determine current act based on slide index
  useEffect(() => {
    const act = getActForSlide(currentSlideIndex);
    
    if (act && act.id !== previousActRef.current?.id) {
      // Act has changed - trigger animation
      const isInitialLoad = previousActRef.current === null;
      
      if (!isInitialLoad) {
        // Play transition sound (quiet click/beep)
        try {
          playSFX('/audio/act-change.mp3');
        } catch {
          // Sound file may not exist, continue silently
        }
      }

      // GSAP glitch/scramble animation
      const tl = gsap.timeline();
      
      if (containerRef.current && phaseRef.current && titleRef.current && lineRef.current) {
        // Initial state - glitch effect (stronger on title)
        tl.set(phaseRef.current, {
          opacity: 0,
          x: -10,
        });
        
        tl.set(titleRef.current, {
          opacity: 0,
          y: 15,
          skewX: isInitialLoad ? 0 : 8,
          scale: 0.95,
        });
        
        // Line flash
        tl.to(lineRef.current, {
          opacity: 0.3,
          scaleY: 0.8,
          duration: 0.05,
          yoyo: true,
          repeat: isInitialLoad ? 0 : 4,
          ease: 'power1.inOut',
        }, 0);

        // Animate phase label in first (small, quick)
        tl.to(phaseRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.25,
          ease: 'power2.out',
        }, isInitialLoad ? 0 : 0.1);

        // Animate title in with emphasis (the star of the show)
        tl.to(titleRef.current, {
          opacity: 1,
          y: 0,
          skewX: 0,
          scale: 1,
          duration: isInitialLoad ? 0.4 : 0.5,
          ease: 'power3.out',
        }, isInitialLoad ? 0.05 : 0.15);

        // Line glow pulse on act change
        if (!isInitialLoad) {
          tl.to(lineRef.current, {
            boxShadow: '0 0 15px rgba(204, 255, 0, 0.6)',
            scaleY: 1,
            duration: 0.2,
            ease: 'power2.out',
          }, 0.1);
          
          tl.to(lineRef.current, {
            boxShadow: '0 0 8px rgba(204, 255, 0, 0.3)',
            duration: 0.5,
            ease: 'power2.inOut',
          }, 0.3);
        }
      }

      previousActRef.current = act;
      setCurrentAct(act);
    }
  }, [currentSlideIndex, playSFX]);

  if (!currentAct) return null;

  // Accessibility: Screen reader announcement
  const ariaLabel = `Entering Act ${currentAct.id}: ${currentAct.name}`;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-6 z-40 flex items-stretch gap-3 md:bottom-8 md:left-8 scale-[0.85] md:scale-100 origin-bottom-left"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {/* Vertical Neon Line - Subtle accent */}
      <div
        ref={lineRef}
        className="w-[2px] bg-[#CCFF00]/60 self-stretch rounded-full"
        style={{
          boxShadow: '0 0 8px rgba(204, 255, 0, 0.3)',
          minHeight: '40px',
        }}
      />

      {/* Text Content - Technical Readout Style */}
      <div className="flex flex-col justify-center">
        {/* Act Label (Small, Neon Signal) */}
        <div
          ref={phaseRef}
          className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-[0.2em] leading-tight mb-1"
          style={{
            textShadow: '0 0 8px rgba(204, 255, 0, 0.5)',
          }}
        >
          ACT // {currentAct.label}
        </div>

        {/* Main Title (System Metadata - Mono, Dark, Sharp) */}
        <div
          ref={titleRef}
          className="font-mono font-medium text-zinc-600 text-lg md:text-xl uppercase tracking-[0.2em] leading-none"
        >
          {currentAct.name}
        </div>
      </div>
    </div>
  );
};

export default ActIndicator;

