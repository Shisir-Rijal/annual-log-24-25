import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useAudio } from '@/context/AudioProvider';

/**
 * AUDIO FILES REQUIRED in /public/audio/:
 * - charge_1.mp3 (click sound 1)
 * - charge_2.mp3 (click sound 2)
 * - charge_3.mp3 (click sound 3)
 * - explosion.mp3 (final explosion)
 * - soundtrack.mp3 (background music)
 * 
 * The soundtrack should have a "drop" around 22-25 seconds
 * for the cinematic sync effect.
 */

// ============================================
// AUDIO CONFIGURATION
// Adjust this to match the "drop" timestamp in your soundtrack.mp3
// ============================================
const DROP_TIMESTAMP = 42.0; // seconds - The beat drop in the soundtrack
const BGM_PATH = '/audio/soundtrack.mp3';

const IntroSlide = () => {
  const { playBGM, playSFX, setBgmVolume, getBgmCurrentTime, seekBGM } = useAudio();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const circleTextRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const progressRingRef = useRef<SVGCircleElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const MAX_CLICKS = 5;

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

  // Breathing animation for circle - speed increases with clicks
  useEffect(() => {
    if (!circleRef.current) return;

    const breathingSpeed = 2.5 - (clickCount * 0.3); // Faster as clicks increase
    const breathingScale = 1.05 + (clickCount * 0.02); // Bigger scale as clicks increase

    // Scale animation (breathing)
    const scaleAnim = gsap.to(circleRef.current, {
      scale: breathingScale,
      duration: breathingSpeed,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    // Opacity animation (breathing glow) - more intense with clicks
    const opacityAnim = gsap.to(circleRef.current, {
      opacity: 0.9 + (clickCount * 0.05),
      duration: breathingSpeed * 0.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    // Glow intensity increases with clicks
    const glowIntensity = 0.3 + (clickCount * 0.1);
    gsap.to(circleRef.current, {
      boxShadow: `0 0 ${15 + clickCount * 5}px rgba(204,255,0,${glowIntensity})`,
      duration: 0.3,
    });

    return () => {
      scaleAnim.kill();
      opacityAnim.kill();
    };
  }, [clickCount]);

  // Update progress ring
  useEffect(() => {
    if (!progressRingRef.current) return;

    const progress = (clickCount / MAX_CLICKS) * 100;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (progress / 100) * circumference;

    gsap.to(progressRingRef.current, {
      strokeDashoffset: offset,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [clickCount]);

  // Handle circle click with audio
  const handleCircleClick = () => {
    if (isExploding || clickCount >= MAX_CLICKS) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    // ============================================
    // AUDIO LOGIC
    // ============================================
    
    if (newCount === 1) {
      // First click: Start BGM at low volume, play charge SFX
      playSFX('/audio/charge_1.mp3');
      playBGM(BGM_PATH, { startTime: 0, loop: true });
      setBgmVolume(0.1); // Start quiet for atmosphere
    } else if (newCount < MAX_CLICKS) {
      // Charging clicks 2-4: Play varying charge SFX, increase BGM volume
      const chargeSfx = `/audio/charge_${Math.min(newCount, 3)}.mp3`;
      playSFX(chargeSfx);
      
      // Gradually increase BGM volume to build tension
      const newVolume = 0.1 + (newCount * 0.1); // 0.2, 0.3, 0.4
      setBgmVolume(newVolume);
    }
    // Click 5 (explosion) audio is handled below with "Hard Sync"

    // ============================================
    // VISUAL ANIMATIONS
    // ============================================

    // Shake/punch animation
    if (circleRef.current) {
      gsap.context(() => {
        // Scale down then bounce back
        gsap.to(circleRef.current, {
          scale: 0.95,
          duration: 0.1,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(circleRef.current, {
              scale: 1,
              duration: 0.3,
              ease: 'elastic.out(1, 0.5)',
            });
          },
        });

        // Red/white flash
        gsap.to(circleRef.current, {
          borderColor: '#ff0000',
          duration: 0.1,
          onComplete: () => {
            gsap.to(circleRef.current, {
              borderColor: '#CCFF00',
              duration: 0.2,
            });
          },
        });
      }, sectionRef);
    }

    // Final click - trigger explosion
    if (newCount === MAX_CLICKS) {
      setIsExploding(true);
      
      // ============================================
      // THE DROP - Cinematic "Hard Sync"
      // ============================================
      playSFX('/audio/explosion.mp3');
      
      // Get current BGM time to decide if we need to jump
      const currentTime = getBgmCurrentTime();
      
      // Only jump FORWARD if we haven't reached the drop yet
      // If the user clicked slowly and already passed the drop, let it continue naturally
      if (currentTime < DROP_TIMESTAMP) {
        seekBGM(DROP_TIMESTAMP);
        console.log(`[IntroSlide] Hard Sync: Jumped from ${currentTime.toFixed(1)}s to ${DROP_TIMESTAMP}s`);
      } else {
        console.log(`[IntroSlide] Already past drop (${currentTime.toFixed(1)}s), letting it play`);
      }
      
      // Crank volume to max for the epic beat drop moment
      setBgmVolume(1.0);

      // Explosion animation
      if (circleRef.current && headerRef.current) {
        gsap.context(() => {
          // Circle explosion
          gsap.to(circleRef.current, {
            scale: 100,
            opacity: 0,
            duration: 1.5,
            ease: 'power3.in',
          });

          // Fade out header with blur
          gsap.to(headerRef.current, {
            opacity: 0,
            filter: 'blur(20px)',
            duration: 1.5,
            ease: 'power2.in',
          });

          // Fade out circle text
          if (circleTextRef.current) {
            gsap.to(circleTextRef.current, {
              opacity: 0,
              duration: 0.8,
              ease: 'power2.in',
            });
          }

          // Show scroll hint after explosion
          gsap.delayedCall(1.5, () => {
            setShowScrollHint(true);
            if (scrollIndicatorRef.current) {
              gsap.fromTo(scrollIndicatorRef.current, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
              );
            }
          });
        }, sectionRef);
      }
    }
  };

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

  const getCircleText = () => {
    if (clickCount === 0) return 'INITIATE';
    if (clickCount < MAX_CLICKS) return `CHARGING... ${clickCount}/${MAX_CLICKS}`;
    return 'INITIATE';
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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative">
          {/* Progress Ring SVG */}
          <svg 
            className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            {/* Progress ring */}
            <circle
              ref={progressRingRef}
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#CCFF00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45}`}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(204,255,0,0.6))',
              }}
            />
          </svg>

          {/* Circle Button */}
          <div
            ref={circleRef}
            onClick={handleCircleClick}
            className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-[#CCFF00] bg-transparent flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)] cursor-pointer relative z-10"
          >
            <p
              ref={circleTextRef}
              className="font-mono text-sm md:text-base uppercase tracking-widest text-[#CCFF00] text-center px-4"
            >
              {getCircleText()}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Bottom (Hidden initially) */}
      <div 
        ref={scrollIndicatorRef}
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-20 ${showScrollHint ? '' : 'opacity-0'}`}
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
