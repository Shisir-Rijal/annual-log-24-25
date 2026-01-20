import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 * 
 * Detects if the user has enabled "Reduce Motion" in their OS settings.
 * Use this to skip or simplify animations for accessibility (WCAG 2.3.3).
 * 
 * @returns {boolean} true if user prefers reduced motion, false otherwise
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * 
 * useEffect(() => {
 *   if (prefersReducedMotion) {
 *     // Skip animation, set final state immediately
 *     gsap.set(element, { opacity: 1, y: 0 });
 *   } else {
 *     // Run full animation
 *     gsap.fromTo(element, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
 *   }
 * }, [prefersReducedMotion]);
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // Check on initial render (SSR-safe)
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Handler for changes (user toggles setting while app is open)
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers: addEventListener
    // Legacy browsers: addListener (deprecated but fallback)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older Safari
      mediaQuery.addListener(handleChange);
    }

    // Cleanup: remove listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older Safari
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};

/**
 * Helper function for non-React contexts (e.g., vanilla GSAP setup)
 * Use sparingly - prefer the hook in React components.
 */
export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default useReducedMotion;

