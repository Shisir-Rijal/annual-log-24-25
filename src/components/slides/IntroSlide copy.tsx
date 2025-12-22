import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const IntroSlide = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const circleTextRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');

  // Humanized typewriter effect with random intervals
  useEffect(() => {
    const fullText = 'THE ANNUAL LOG 2024';
    let currentIndex = 0;

    const getRandomDelay = (char: string) => {
      // Longer pause for spaces
      if (char === ' ') {
        return 100 + Math.random() * 200; // 100-300ms for spaces
      }
      // Random delay between 50ms and 300ms for regular characters
      return 50 + Math.random() * 250;
    };

    const typeWriter = () => {
      if (currentIndex < fullText.length) {
        const currentChar = fullText[currentIndex];
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        
        const delay = getRandomDelay(currentChar);
        setTimeout(typeWriter, delay);
      }
    };

    // Start typing after a short delay
    const timer = setTimeout(typeWriter, 500);
    return () => clearTimeout(timer);
  }, []);

  // Breathing animation for circle - scale and opacity (only when not scrolling)
  useEffect(() => {
    if (!circleRef.current) return;

    // Scale animation (breathing) - will be paused during scroll
    const breathingScale = gsap.to(circleRef.current, {
      scale: 1.05,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      paused: false,
    });

    // Opacity animation (breathing glow)
    const breathingOpacity = gsap.to(circleRef.current, {
      opacity: 0.9,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      paused: false,
    });

    // Store animations for later control
    (circleRef.current as any).breathingAnimations = { breathingScale, breathingOpacity };

    // Aggressive blinking for text inside circle
    if (circleTextRef.current) {
      gsap.to(circleTextRef.current, {
        opacity: 0.2,
        duration: 0.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }
  }, []);

  // ScrollTrigger animation - Warp Drive / Through the Ring effect
  useEffect(() => {
    if (!sectionRef.current || !circleRef.current || !headerRef.current) return;

    const ctx = gsap.context(() => {
      // Create timeline for coordinated animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          onEnter: () => {
            // Pause breathing animations when scrolling starts
            const breathingAnims = (circleRef.current as any)?.breathingAnimations;
            if (breathingAnims) {
              breathingAnims.breathingScale?.pause();
              breathingAnims.breathingOpacity?.pause();
            }
          },
          onLeaveBack: () => {
            // Resume breathing animations when scrolling back
            const breathingAnims = (circleRef.current as any)?.breathingAnimations;
            if (breathingAnims) {
              breathingAnims.breathingScale?.resume();
              breathingAnims.breathingOpacity?.resume();
            }
          },
        },
      });

      // Header and Footer: Scale out, blur, and fade early in the process
      // Using < operator to make this happen early (at 20% of the scroll)
      tl.to(
        [headerRef.current, scrollIndicatorRef.current],
        {
          scale: 1.5,
          filter: 'blur(20px)',
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        },
        '<0.2' // Start at 20% of timeline
      );

      // Circle: Massive scale up (1 → 150) - the main warp effect
      tl.to(
        circleRef.current,
        {
          scale: 150,
          borderWidth: '3px', // Increase border width to keep it visible
          duration: 1,
          ease: 'power3.in',
        },
        '<' // Start slightly after header/footer animation
      );

      // Circle text: Fade out as circle grows
      if (circleTextRef.current) {
        tl.to(
          circleTextRef.current,
          {
            opacity: 0,
            scale: 0.5,
            duration: 0.3,
            ease: 'power2.in',
          },
          '<0.1' // Start very early
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Split text for color coding
  const renderHeaderText = () => {
    const text = displayedText || '';
    const yearIndex = text.indexOf('2024');
    
    if (yearIndex !== -1) {
      // "2024" is in the text
      const beforeYear = text.substring(0, yearIndex);
      const year = text.substring(yearIndex);
      return (
        <>
          <span className="text-foreground">{beforeYear}</span>
          <span className="text-[#CCFF00]">{year}</span>
        </>
      );
    }
    
    // "2024" hasn't been typed yet
    return <span className="text-foreground">{text}</span>;
  };

  return (
    <section 
      ref={sectionRef}
      className="section-slide bg-background relative overflow-hidden"
    >
      {/* Header - Top Left */}
      <div 
        ref={headerRef}
        className="absolute top-8 left-8 z-20"
      >
        <p className="font-mono text-2xl md:text-4xl uppercase tracking-widest">
          {renderHeaderText()}
          <span className="text-[#CCFF00] animate-pulse">|</span>
        </p>
      </div>

      {/* Central Circle - The Trigger */}
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div
          ref={circleRef}
          className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-[#CCFF00] bg-transparent flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)]"
          style={{ borderWidth: '1px' }} // Initial border width, will be animated
        >
          <p
            ref={circleTextRef}
            className="font-mono text-sm md:text-base uppercase tracking-widest text-[#CCFF00]"
          >
            INITIATE
          </p>
        </div>
      </div>

      {/* Scroll Indicator - Bottom */}
      <div 
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
          SCROLL TO UNLOCK
        </p>
        {/* Chevron Arrow */}
        <div className="flex justify-center mt-2">
          <svg
            className="w-4 h-4 text-muted-foreground animate-bounce"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default IntroSlide;
