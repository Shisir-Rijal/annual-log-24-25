import { useEffect, useRef, useMemo } from 'react';
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
  const headerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const mvpRowRef = useRef<HTMLDivElement>(null);
  const mvpBarRef = useRef<HTMLDivElement>(null);
  const mvpTextRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get weekday distribution
  const weekdayData = data ? getWeekdayDistribution(data.rawLogs) : null;

  // Sort days by count (highest first) and calculate stats
  const sortedData = useMemo(() => {
    if (!weekdayData) return null;

    const { peakDay, orbitals } = weekdayData;
    const allDays = [peakDay, ...orbitals];
    
    // Sort by count descending
    const sorted = [...allDays].sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...sorted.map(d => d.count), 1);
    
    return {
      sorted,
      maxCount,
      winner: sorted[0],
      rest: sorted.slice(1),
    };
  }, [weekdayData]);

  // Animation: Loading Stats
  useEffect(() => {
    if (!sectionRef.current || !sortedData) return;

    const ctx = gsap.context(() => {
      const bars = barRefs.current.filter(Boolean);
      const texts = textRefs.current.filter(Boolean);
      const rows = rowRefs.current.filter(Boolean);

      // Set initial states
      if (headerRef.current) {
        gsap.set(headerRef.current, { opacity: 0, y: -30 });
      }

      if (mvpRowRef.current) {
        gsap.set(mvpRowRef.current, { opacity: 0, y: 20 });
      }

      if (mvpBarRef.current) {
        gsap.set(mvpBarRef.current, { width: '0%' });
      }

      if (mvpTextRef.current) {
        gsap.set(mvpTextRef.current, { opacity: 0, x: -20 });
      }

      rows.forEach((row) => {
        if (row) gsap.set(row, { opacity: 0, y: 10 });
      });

      bars.forEach((bar) => {
        if (bar) gsap.set(bar, { width: '0%' });
      });

      texts.forEach((text) => {
        if (text) gsap.set(text, { opacity: 0, x: -20 });
      });

      // Create ScrollTrigger
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const masterTimeline = gsap.timeline();

          // STEP 1: Header slides down
          if (headerRef.current) {
            masterTimeline.to(headerRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
            });
          }

          // STEP 2: MVP Row appears
          if (mvpRowRef.current) {
            masterTimeline.to(
              mvpRowRef.current,
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power3.out',
              },
              '-=0.2'
            );
          }

          // MVP Bar expands
          if (mvpBarRef.current) {
            masterTimeline.to(
              mvpBarRef.current,
              {
                width: '100%',
                duration: 1,
                ease: 'power3.out',
              },
              '-=0.3'
            );
          }

          // MVP Text snaps in
          if (mvpTextRef.current) {
            masterTimeline.to(
              mvpTextRef.current,
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: 'power2.out',
              },
              '-=0.7'
            );
          }

          // STEP 3: Flash effect on MVP
          if (mvpRowRef.current) {
            masterTimeline.to(
              mvpRowRef.current,
              {
                boxShadow: '0 0 40px rgba(204, 255, 0, 0.8), 0 0 60px rgba(204, 255, 0, 0.4)',
                duration: 0.2,
                ease: 'power2.in',
              },
              '-=0.1'
            );
            masterTimeline.to(
              mvpRowRef.current,
              {
                boxShadow: '0 0 20px rgba(204, 255, 0, 0.3)',
                duration: 0.4,
                ease: 'power2.out',
              }
            );
          }

          // STEP 4: Rest of the rows (staggered)
          rows.forEach((row, index) => {
            if (!row) return;
            const bar = barRefs.current[index];
            const text = textRefs.current[index];
            const dayData = sortedData.rest[index];
            const widthPercent = dayData ? (dayData.count / sortedData.maxCount) * 100 : 0;

            masterTimeline.to(
              row,
              {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out',
              },
              index === 0 ? '-=0.2' : '-=0.15'
            );

            if (bar) {
              masterTimeline.to(
                bar,
                {
                  width: `${widthPercent}%`,
                  duration: 0.8,
                  ease: 'power3.out',
                },
                '-=0.25'
              );
            }

            if (text) {
              masterTimeline.to(
                text,
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.3,
                  ease: 'power2.out',
                },
                '-=0.6'
              );
            }
          });
        },
        onLeaveBack: () => {
          // Reset all elements
          if (headerRef.current) {
            gsap.set(headerRef.current, { opacity: 0, y: -30 });
          }
          if (mvpRowRef.current) {
            gsap.set(mvpRowRef.current, { opacity: 0, y: 20, boxShadow: 'none' });
          }
          if (mvpBarRef.current) {
            gsap.set(mvpBarRef.current, { width: '0%' });
          }
          if (mvpTextRef.current) {
            gsap.set(mvpTextRef.current, { opacity: 0, x: -20 });
          }
          rowRefs.current.forEach((row) => {
            if (row) gsap.set(row, { opacity: 0, y: 10 });
          });
          barRefs.current.forEach((bar) => {
            if (bar) gsap.set(bar, { width: '0%' });
          });
          textRefs.current.forEach((text) => {
            if (text) gsap.set(text, { opacity: 0, x: -20 });
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [sortedData]);

  if (!sortedData) {
    return (
      <section 
        tabIndex={0}
        aria-label="Grind Slide - Loading weekday distribution"
        className="section-slide bg-gradient-slide-3 noise focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  const { winner, rest, maxCount } = sortedData;
  const winnerAlliteration = dayAlliterations[winner.dayName] || 'POWER';

  return (
    <section 
      ref={sectionRef} 
      tabIndex={0}
      aria-label="Grind Slide - Peak weekday analysis"
      className="section-slide bg-gradient-slide-3 noise focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-24 md:pt-20">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-8 md:mb-12">
          <h2 className="text-display text-4xl md:text-5xl mb-2">
            <span className="text-primary neon-text">{winner.dayName}</span>
            <br />
            <span className="text-foreground">{winnerAlliteration}</span>
          </h2>
          <p className="font-mono text-sm text-muted-foreground tracking-widest">
            YOUR FAVORITE DAY TO LIFT
          </p>
        </div>

        {/* The List Container */}
        <div 
          ref={listContainerRef}
          className="w-full max-w-xl md:max-w-2xl flex flex-col gap-3"
        >
          {/* Row 1: The Winner / MVP */}
          <div
            ref={mvpRowRef}
            className="relative h-20 md:h-24 bg-zinc-900/80 rounded-lg overflow-hidden border border-primary/30"
            style={{ boxShadow: '0 0 20px rgba(204, 255, 0, 0.3)' }}
          >
            {/* Bar Background */}
            <div
              ref={mvpBarRef}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/40 via-primary/30 to-primary/20"
              style={{ width: '0%' }}
            />

            {/* Content */}
            <div
              ref={mvpTextRef}
              className="relative z-10 h-full flex items-center justify-between px-4 md:px-6"
            >
              <div className="flex items-center gap-3 md:gap-4">
                {/* MVP Badge */}
                <div className="flex flex-col items-center justify-center bg-primary/20 rounded px-2 py-1 border border-primary/50">
                  <span className="font-mono text-[10px] text-primary font-bold">PEAK</span>
                </div>
                
                {/* Day Info */}
                <div>
                  <p className="font-display text-xl md:text-2xl font-bold text-foreground uppercase tracking-wide">
                    {winnerAlliteration}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {winner.dayName}
                  </p>
                </div>
              </div>

              {/* Count */}
              <div className="text-right">
                <p className="font-mono text-3xl md:text-4xl font-bold text-primary">
                  {winner.count}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase">sessions</p>
              </div>
            </div>
          </div>

          {/* Rows 2-7: The Rest */}
          {rest.map((day, index) => {
            const widthPercent = (day.count / maxCount) * 100;
            const alliteration = dayAlliterations[day.dayName] || '';

            return (
              <div
                key={day.dayName}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                className="relative h-12 md:h-14 bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-800/50"
              >
                {/* Bar Background */}
                <div
                  ref={(el) => {
                    barRefs.current[index] = el;
                  }}
                  className="absolute inset-y-0 left-0 bg-zinc-700/50"
                  style={{ width: '0%' }}
                />

                {/* Content */}
                <div
                  ref={(el) => {
                    textRefs.current[index] = el;
                  }}
                  className="relative z-10 h-full flex items-center justify-between px-4 md:px-6"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Rank */}
                    <span className="font-mono text-xs text-zinc-500 w-4">
                      {index + 2}
                    </span>
                    
                    {/* Day Abbr */}
                    <span className="font-mono text-sm md:text-base font-bold text-foreground w-10">
                      {day.shortName}
                    </span>

                    {/* Alliteration (hidden on mobile) */}
                    <span className="hidden md:block font-mono text-xs text-zinc-500 uppercase tracking-wider">
                      {alliteration}
                    </span>
                  </div>

                  {/* Count */}
                  <div className="flex items-center gap-2">
                    {/* Visual indicator of relative size */}
                    <div className="hidden md:flex items-center gap-1">
                      {Array.from({ length: Math.ceil(widthPercent / 20) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-3 bg-zinc-600 rounded-sm"
                        />
                      ))}
                    </div>
                    <span className="font-mono text-lg md:text-xl font-bold text-foreground">
                      {day.count}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GrindSlide;
