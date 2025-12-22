import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWorkoutData } from '@/context/DataProvider';
import { getWeekdayDistribution } from '@/utils/dataProcessor';

gsap.registerPlugin(ScrollTrigger);

// Alliteration map for day names
const dayAlliterations: Record<string, string> = {
  'SUNDAY': 'SANCTUARY',
  'MONDAY': 'MADNESS',
  'TUESDAY': 'THRUST',
  'WEDNESDAY': 'WARRIOR',
  'THURSDAY': 'THUNDER',
  'FRIDAY': 'FURY',
  'SATURDAY': 'SURGE',
};

const GrindSlide = () => {
  const { data } = useWorkoutData();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const centerCircleRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get weekday distribution
  const weekdayData = data ? getWeekdayDistribution(data.rawLogs) : null;
  
  if (!weekdayData) {
    return (
      <section className="section-slide bg-gradient-slide-3 noise">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  const { peakDay, orbitals } = weekdayData;
  const allDays = [peakDay, ...orbitals];
  const maxValue = Math.max(...allDays.map(d => d.count), 1);

  // Get alliteration for peak day
  const peakDayAlliteration = dayAlliterations[peakDay.dayName] || 'POWER';

  // Animation: Orbit & Settle Timeline
  useEffect(() => {
    if (!containerRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const circles = circleRefs.current.filter(Boolean);
      
      // Helper function to get random start position based on quadrant
      const getStartPosition = (angle: number) => {
        // Determine quadrant based on angle
        const normalizedAngle = ((angle + 90) % 360 + 360) % 360;
        let xOffset = 0;
        let yOffset = 0;
        
        if (normalizedAngle >= 0 && normalizedAngle < 90) {
          // Top-right quadrant
          xOffset = 600;
          yOffset = -600;
        } else if (normalizedAngle >= 90 && normalizedAngle < 180) {
          // Top-left quadrant
          xOffset = -600;
          yOffset = -600;
        } else if (normalizedAngle >= 180 && normalizedAngle < 270) {
          // Bottom-left quadrant
          xOffset = -600;
          yOffset = 600;
        } else {
          // Bottom-right quadrant
          xOffset = 600;
          yOffset = 600;
        }
        
        return { x: xOffset, y: yOffset };
      };

      // Set initial state for all circles (chaotic start)
      circles.forEach((circle, index) => {
        if (!circle) return;
        
        const angle = (index * 360) / 7 - 90;
        const startPos = getStartPosition(angle);
        const randomRotation = (Math.random() - 0.5) * 360; // Random rotation between -180 and 180
        
        gsap.set(circle, {
          opacity: 0,
          scale: 3,
          rotation: randomRotation,
          x: startPos.x,
          y: startPos.y,
        });
      });

      // Set initial state for center circle
      if (centerCircleRef.current) {
        gsap.set(centerCircleRef.current, {
          opacity: 0,
          scale: 0.5,
        });
      }

      // Create ScrollTrigger
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          // Create master timeline
          const masterTimeline = gsap.timeline();

          // Animate center circle first (the sun)
          if (centerCircleRef.current) {
            masterTimeline.to(centerCircleRef.current, {
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: 'power3.out',
            });
          }

          // Animate each planet with orbit & settle effect
          circles.forEach((circle, index) => {
            if (!circle) return;
            
            // The final position is already set in CSS (left/top in %)
            // We animate from the chaotic start position (set in gsap.set) to 0,0
            // which means "back to the CSS-defined position"
            
            // Add to timeline with stagger
            masterTimeline.to(
              circle,
              {
                opacity: 1,
                scale: 1,
                rotation: 0, // Settle to perfect readable orientation
                x: 0, // Return to CSS-defined position
                y: 0, // Return to CSS-defined position
                duration: 3.5, // Long cinematic journey
                ease: 'elastic.out(1, 0.5)', // Smooth bounce on arrival
              },
              index === 0 ? '+=0.3' : '-=2.5' // Overlap animations but with stagger
            );
          });

          // Slow rotation animation for the container (solar system effect)
          // Start after planets have settled
          if (containerRef.current) {
            masterTimeline.to(
              containerRef.current,
              {
                rotation: 360,
                duration: 60, // Very slow rotation (60 seconds for full rotation)
                ease: 'none',
                repeat: -1,
              },
              '-=1' // Start slightly before planets fully settle
            );
          }
        },
        onLeaveBack: () => {
          // Reset on scroll back
          if (centerCircleRef.current) {
            gsap.set(centerCircleRef.current, { opacity: 0, scale: 0.5 });
          }
          circles.forEach((circle, index) => {
            if (!circle) return;
            const angle = (index * 360) / 7 - 90;
            const startPos = getStartPosition(angle);
            const randomRotation = (Math.random() - 0.5) * 360;
            gsap.set(circle, {
              opacity: 0,
              scale: 3,
              rotation: randomRotation,
              x: startPos.x,
              y: startPos.y,
            });
          });
          if (containerRef.current) {
            gsap.killTweensOf(containerRef.current);
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [weekdayData, allDays, maxValue]);

  return (
    <section ref={sectionRef} className="section-slide bg-gradient-slide-3 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <h2 className="text-display text-huge text-center mb-2">
          <span className="text-primary neon-text">{peakDay.dayName}</span>
          <br />
          <span className="text-foreground">{peakDayAlliteration}</span>
        </h2>
        
        <p className="font-mono text-sm text-muted-foreground mb-12">
          YOUR FAVORITE DAY TO LIFT
        </p>
        
        {/* Radial Chart Container */}
        <div id="chart-container" className="chart-container max-w-lg gsap-chart">
          <div 
            ref={containerRef}
            className="relative w-64 h-64 md:w-80 md:h-80"
            style={{ transformOrigin: 'center center' }}
          >
            {/* Center Circle - The Sun */}
            <div 
              ref={centerCircleRef}
              className="absolute inset-1/4 rounded-full bg-secondary/50 flex items-center justify-center"
              style={{ opacity: 0 }}
            >
              <div className="text-center">
                <p className="text-stat text-xl md:text-2xl text-primary">{peakDay.count}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{peakDay.dayName}</p>
              </div>
            </div>
            
            {/* Day Segments - The Planets */}
            {allDays.map((day, index) => {
              // Calculate angle: start from top (-90) and distribute evenly
              // Peak day should be at the top (index 0)
              const angle = (index * 360) / 7 - 90;
              // Radius based on count (normalized to maxValue)
              const normalizedCount = day.count / maxValue;
              const radius = 45 + normalizedCount * 35;
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
              
              const isPeakDay = index === 0;
              
              return (
                <div
                  key={`${day.dayName}-${index}`}
                  ref={(el) => {
                    circleRefs.current[index] = el;
                  }}
                  className="day-circle absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                  }}
                >
                  <div 
                    className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center text-xs md:text-sm font-mono font-bold transition-all ${
                      isPeakDay
                        ? 'bg-primary text-primary-foreground neon-glow' 
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <span className="mb-1">{day.shortName}</span>
                    {day.count > 0 && (
                      <span className="text-[10px] md:text-xs opacity-70">{day.count}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrindSlide;
