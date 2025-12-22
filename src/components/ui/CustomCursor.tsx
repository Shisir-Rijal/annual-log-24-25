import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
  const IS_ENABLED = false;

  // Early return if disabled
  if (!IS_ENABLED) {
    return null;
  }

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    // Hide default cursor on desktop only
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && IS_ENABLED) {
        document.body.style.cursor = 'none';
      } else {
        document.body.style.cursor = 'auto';
      }
    };

    // Initial check
    handleMediaChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleMediaChange);

    // Initialize GSAP quickTo for performance
    const dotX = gsap.quickTo(dotRef.current, 'x', { duration: 0, ease: 'power1.out' });
    const dotY = gsap.quickTo(dotRef.current, 'y', { duration: 0, ease: 'power1.out' });
    const ringX = gsap.quickTo(ringRef.current, 'x', { duration: 0.5, ease: 'power3.out' });
    const ringY = gsap.quickTo(ringRef.current, 'y', { duration: 0.5, ease: 'power3.out' });

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!mediaQuery.matches || !IS_ENABLED) return; // Only on desktop and if enabled

      const x = e.clientX;
      const y = e.clientY;

      // Dot follows immediately
      dotX(x);
      dotY(y);

      // Ring follows with delay
      ringX(x);
      ringY(y);
    };

    // Hover handlers for links and buttons
    const handleMouseEnter = () => {
      if (!mediaQuery.matches || !IS_ENABLED) return;
      isHoveringRef.current = true;
      
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          opacity: 0,
          duration: 0.2,
        });
      }
    };

    const handleMouseLeave = () => {
      if (!mediaQuery.matches || !IS_ENABLED) return;
      isHoveringRef.current = false;
      
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          opacity: 1,
          duration: 0.2,
        });
      }
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);

    // Use event delegation for hover effects on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      if (!mediaQuery.matches || !IS_ENABLED) return;
      
      const target = e.target as HTMLElement;
      if (target.matches('a, button, [role="button"], [data-cursor-hover]')) {
        handleMouseEnter();
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!mediaQuery.matches || !IS_ENABLED) return;
      
      const target = e.target as HTMLElement;
      if (target.matches('a, button, [role="button"], [data-cursor-hover]')) {
        handleMouseLeave();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      mediaQuery.removeEventListener('change', handleMediaChange);

      // Restore cursor
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Only render on desktop
  return (
    <>
      {/* Dot - Follows immediately */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#CCFF00] rounded-full pointer-events-none z-50"
        style={{
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
        }}
      />

      {/* Ring - Follows with delay */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border border-[#CCFF00] rounded-full pointer-events-none z-50"
        style={{
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;

