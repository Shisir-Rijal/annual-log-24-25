import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const hasMoved = useRef(false);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Check if device supports hover (desktop only)
    const hoverMediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    
    // Early return if mobile/touch device
    if (!hoverMediaQuery.matches) {
      return;
    }

    // Aggressive CSS injection to force-hide system cursor on ALL elements
    const style = document.createElement('style');
    style.id = 'custom-cursor-override';
    style.textContent = `
      html, body, * {
        cursor: none !important;
      }
      a, button, [type="button"], [role="button"], input, select, textarea {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    styleTagRef.current = style;

    // Initialize GSAP quickTo for smooth movement
    const cursorX = gsap.quickTo(cursorRef.current, 'x', { duration: 0.1, ease: 'power2.out' });
    const cursorY = gsap.quickTo(cursorRef.current, 'y', { duration: 0.1, ease: 'power2.out' });

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Show cursor on first movement
      if (!hasMoved.current) {
        hasMoved.current = true;
        if (cursorRef.current) {
          gsap.to(cursorRef.current, {
            autoAlpha: 1,
            duration: 0.2,
            ease: 'power2.out',
          });
        }
      }

      cursorX(x);
      cursorY(y);
    };

    // Hover state handlers
    const handleMouseEnter = () => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          scale: 1.2,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    };

    // Event delegation for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, input, [role="button"], [data-cursor-hover]')) {
        handleMouseEnter();
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, input, [role="button"], [data-cursor-hover]')) {
        handleMouseLeave();
      }
    };

    // Add event listeners - mousemove MUST be on window
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      
      // Remove CSS override style tag
      if (styleTagRef.current && styleTagRef.current.parentNode) {
        document.head.removeChild(styleTagRef.current);
        styleTagRef.current = null;
      }
    };
  }, []);

  // Don't render on mobile/touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[999999] opacity-0"
      aria-hidden="true"
      style={{
        willChange: 'transform',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <path
          d="M0 0l5.8 19.3 2.5-6.8 6.7 0L0 0z"
          fill="#000000"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default CustomCursor;
