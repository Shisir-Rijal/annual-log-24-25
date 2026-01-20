import { useMemo, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import workouts from '../../data/clean_workouts.json';

interface WorkoutLog {
  date: string;
  year?: number;
  month?: number;
  yearMonth?: string;
  [key: string]: unknown;
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const PeakMonthSlide = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Calculate peak month data
  const peakData = useMemo(() => {
    const logs = workouts as WorkoutLog[];

    // Group sessions by yearMonth and count unique dates
    const monthCounts = new Map<string, Set<string>>();

    logs.forEach(log => {
      const yearMonth = log.yearMonth || `${log.year}-${String(log.month).padStart(2, '0')}`;
      const dateStr = log.date?.split('T')[0];
      
      if (!monthCounts.has(yearMonth)) {
        monthCounts.set(yearMonth, new Set());
      }
      if (dateStr) {
        monthCounts.get(yearMonth)!.add(dateStr);
      }
    });

    // Find peak month
    let peakMonth = '';
    let maxSessions = 0;

    monthCounts.forEach((dates, yearMonth) => {
      if (dates.size > maxSessions) {
        maxSessions = dates.size;
        peakMonth = yearMonth;
      }
    });

    // Parse peak month
    const [yearStr, monthStr] = peakMonth.split('-');
    const year = parseInt(yearStr) || 2024;
    const month = parseInt(monthStr) || 11; // 1-indexed

    // Get active days (day numbers 1-31)
    const activeDaysSet = monthCounts.get(peakMonth) || new Set();
    const activeDays = Array.from(activeDaysSet).map(dateStr => {
      const d = new Date(dateStr);
      return d.getDate();
    }).sort((a, b) => a - b);

    // Calculate days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Calculate start day of week (0 = Sunday, 6 = Saturday)
    const startDay = new Date(year, month - 1, 1).getDay();

    // Calculate percentage
    const activePercentage = Math.round((activeDays.length / daysInMonth) * 100);

    // Month name
    const monthName = MONTH_NAMES[month - 1] || 'NOVEMBER';

    return {
      year,
      month,
      monthName,
      daysInMonth,
      startDay,
      activeDays,
      sessionCount: activeDays.length,
      activePercentage
    };
  }, []);

  // Generate calendar grid (42 cells = 6 weeks)
  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - peakData.startDay + 1;
      if (dayNum < 1 || dayNum > peakData.daysInMonth) return null;
      return dayNum;
    });
  }, [peakData]);

  // GSAP Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate title
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8 }
      );

      // Animate subtitle
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.4'
      );

      // Animate calendar grid cells (staggered)
      const cells = calendarRef.current?.querySelectorAll('.calendar-cell');
      if (cells) {
        tl.fromTo(
          cells,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, stagger: { amount: 0.8, from: 'random' } },
          '-=0.3'
        );
      }

      // Neon pulse effect on active cells
      const activeCells = calendarRef.current?.querySelectorAll('.day-active');
      if (activeCells) {
        tl.to(
          activeCells,
          {
            boxShadow: '0 0 20px rgba(204, 255, 0, 0.8)',
            duration: 0.3,
            yoyo: true,
            repeat: 1
          },
          '+=0.2'
        );
      }

      // Animate stats
      tl.fromTo(
        statsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.5'
      );

      // Counter animation for session count
      const sessionEl = statsRef.current?.querySelector('.session-count');
      if (sessionEl) {
        const target = { val: 0 };
        tl.to(
          target,
          {
            val: peakData.sessionCount,
            duration: 1,
            ease: 'power2.out',
            onUpdate: () => {
              sessionEl.textContent = Math.round(target.val).toString();
            }
          },
          '-=0.5'
        );
      }

      // Counter animation for percentage
      const percentEl = statsRef.current?.querySelector('.percent-count');
      if (percentEl) {
        const target = { val: 0 };
        tl.to(
          target,
          {
            val: peakData.activePercentage,
            duration: 1,
            ease: 'power2.out',
            onUpdate: () => {
              percentEl.textContent = `${Math.round(target.val)}%`;
            }
          },
          '-=1'
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [peakData]);

  return (
    <section 
      ref={sectionRef} 
      tabIndex={0}
      aria-label="Peak Month Slide - Most active training month"
      className="section-slide bg-gradient-slide-5 noise focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <h2 ref={titleRef} className="text-display text-huge text-center mb-2">
          <span className="text-primary neon-text">{peakData.monthName}</span>
          <br />
          <span className="text-foreground">REIGN</span>
        </h2>

        <p ref={subtitleRef} className="font-mono text-sm text-muted-foreground mb-8">
          YOUR PEAK PERFORMANCE MONTH
        </p>

        {/* Calendar Grid */}
        <div ref={calendarRef} id="calendar-container" className="gsap-calendar w-full max-w-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center font-mono text-xs text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`calendar-cell aspect-square rounded-md flex items-center justify-center font-mono text-sm transition-all ${
                  day === null
                    ? 'bg-transparent'
                    : peakData.activeDays.includes(day)
                    ? 'day-active bg-primary text-primary-foreground neon-glow'
                    : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div ref={statsRef} className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <p className="text-stat text-2xl text-primary session-count">0</p>
              <p className="font-mono text-xs text-muted-foreground">SESSIONS</p>
            </div>
            <div className="text-center">
              <p className="text-stat text-2xl text-foreground percent-count">0%</p>
              <p className="font-mono text-xs text-muted-foreground">ACTIVE DAYS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeakMonthSlide;
