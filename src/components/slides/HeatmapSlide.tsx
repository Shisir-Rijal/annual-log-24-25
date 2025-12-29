import { useMemo } from 'react';
import workouts from '../../data/clean_workouts.json';

interface WorkoutLog {
  date: string;
  [key: string]: unknown;
}

interface DayData {
  date: string;
  present: boolean;
  weekday: number;
  weekIndex: number;
}

interface MonthLabel {
  label: string;
  weekIndex: number;
}

const HeatmapSlide = () => {
  // LOGIC PORT FROM D3
  const heatmapData = useMemo(() => {
    const logs = workouts as WorkoutLog[];

    // 1. Rollup: Create a Set of active dates (YYYY-MM-DD)
    // We use UTC to avoid timezone issues shifting days
    const activeDates = new Set(
      logs.map(w => {
        const d = new Date(w.date);
        return d.toISOString().split('T')[0];
      })
    );

    // 2. Find Min/Max Dates
    const timestamps = logs.map(w => new Date(w.date).getTime());
    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    // 3. Floor Start to previous Monday (UTC)
    // JS getUTCDay: 0=Sun, 1=Mon ... 6=Sat
    const start = new Date(minDate);
    const startDay = start.getUTCDay(); // 0 (Sun) to 6 (Sat)
    // We want 0=Mon, ... 6=Sun.
    // Correction: if Sun(0), shift back 6 days. Else shift back (day-1).
    const shiftStart = startDay === 0 ? 6 : startDay - 1;
    start.setUTCDate(start.getUTCDate() - shiftStart);
    start.setUTCHours(0, 0, 0, 0);

    // 4. Ceil End to next Monday (UTC)
    const end = new Date(maxDate);
    const endDay = end.getUTCDay();
    const shiftEnd = endDay === 0 ? 1 : 8 - endDay; // Distance to next Monday
    end.setUTCDate(end.getUTCDate() + shiftEnd);
    end.setUTCHours(0, 0, 0, 0);

    // 5. Generate Daily Array
    const days: DayData[] = [];
    const months: MonthLabel[] = []; // To store label positions
    const current = new Date(start);
    let weekIndex = 0;

    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];

      // Calculate Weekday (0=Mon ... 6=Sun)
      const jsDay = current.getUTCDay();
      const weekday = jsDay === 0 ? 6 : jsDay - 1;

      // Check for Month Label (First week of month)
      if (weekday === 0 && current.getUTCDate() <= 7) {
        months.push({
          label: current.toLocaleString('default', { month: 'short' }).toUpperCase(),
          weekIndex: weekIndex
        });
      }

      days.push({
        date: dateStr,
        present: activeDates.has(dateStr),
        weekday: weekday, // Y-Axis
        weekIndex: weekIndex // X-Axis
      });

      // Next day
      current.setUTCDate(current.getUTCDate() + 1);

      // If we just finished Sunday (6), increment week index
      if (weekday === 6) weekIndex++;
    }

    return { days, totalWeeks: weekIndex + 1, months };
  }, []);

  return (
    <section className="section-slide bg-gradient-slide-5 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
            ACTIVITY_GRID
          </p>
          <h2 className="text-display text-large text-center">
            <span className="text-foreground">YOUR</span>
            <span className="text-primary neon-text"> RHYTHM</span>
          </h2>
        </div>

        {/* Heatmap Container */}
        <div className="relative z-10 overflow-x-auto max-w-full pb-4">
          <div className="flex">
            {/* Day Labels (Left) - Adjusted Height */}
            <div className="flex flex-col justify-between pr-4 py-1 text-[10px] font-mono text-gray-600 h-[164px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* The Grid */}
            <div className="relative">
              {/* Month Labels (Top) - Adjusted Calculation */}
              <div className="flex relative h-6 w-full mb-2">
                {heatmapData.months.map((m, i) => (
                  <span
                    key={i}
                    className="absolute text-[10px] font-bold font-mono text-gray-500"
                    style={{ left: `${m.weekIndex * 24}px` }} // 20px cell + 4px gap = 24px step
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              {/* Cells - Bigger Size */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: 'repeat(7, 20px)', // 20px height per row
                  gridAutoFlow: 'column',
                  gap: '4px', // Increased gap
                  width: 'max-content'
                }}
              >
                {heatmapData.days.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.present ? 'TRAINED' : 'REST'}`}
                    className={`
                      w-5 h-5 rounded-sm transition-all duration-300 cursor-pointer
                      ${
                        day.present
                          ? 'bg-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.6)] z-10 hover:scale-125'
                          : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-8 mt-10 opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white/5 rounded-sm"></div>
            <span className="text-xs font-mono text-gray-400">REST</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.6)] rounded-sm"></div>
            <span className="text-xs font-mono text-[#CCFF00]">GRIND</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-gray-500">
            {heatmapData.days.filter(d => d.present).length} days trained across{' '}
            {heatmapData.totalWeeks} weeks
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeatmapSlide;

