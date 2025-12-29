import { useMemo } from 'react';
import workouts from '../../data/clean_workouts.json';

interface WorkoutLog {
  date: string;
  weight?: number | string;
  reps?: number | string;
  volume?: number | string;
  [key: string]: unknown;
}

// Helper to safely parse numbers from potentially string values
const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const FrequencySlide = () => {
  // Calculate metrics from raw JSON data
  const metrics = useMemo(() => {
    const logs = workouts as WorkoutLog[];
    
    // Total Sessions: Count of unique dates
    const uniqueDatesArray = [...new Set(logs.map(log => log.date?.split('T')[0]))].filter(Boolean).sort();
    const totalSessions = uniqueDatesArray.length;
    
    // Total Volume: Use pre-calculated 'volume' field if available, otherwise weight * reps
    // Divide by 1000 to get Tons
    const totalVolume = logs.reduce((sum, log) => {
      // Try to use pre-calculated volume first
      if (log.volume !== undefined) {
        return sum + safeNumber(log.volume);
      }
      // Fallback: calculate from weight * reps
      const weight = safeNumber(log.weight);
      const reps = safeNumber(log.reps);
      return sum + (weight * reps);
    }, 0) / 1000;
    
    // Avg Sessions per Week: (lastDate - firstDate) in weeks, then sessions / weeks
    let avgSessionsPerWeek = 0;
    if (uniqueDatesArray.length >= 2) {
      const firstDate = new Date(uniqueDatesArray[0]);
      const lastDate = new Date(uniqueDatesArray[uniqueDatesArray.length - 1]);
      const totalMs = lastDate.getTime() - firstDate.getTime();
      const totalWeeks = totalMs / 604800000; // ms per week
      avgSessionsPerWeek = totalWeeks > 0 ? totalSessions / totalWeeks : 0;
    }
    
    // Hours Invested: Hardcoded 14026 minutes / 60
    const hoursInvested = Math.round(14026 / 60);
    
    return {
      totalSessions,
      totalVolume: totalVolume.toFixed(1),
      avgSessionsPerWeek: avgSessionsPerWeek.toFixed(1),
      hoursInvested
    };
  }, []);

  return (
    <section className="section-slide bg-gradient-slide-2 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Label */}
        <p className="font-mono text-sm text-muted-foreground tracking-[0.3em] uppercase mb-6">
          TOTAL WORKOUTS
        </p>
        
        {/* Counter - Hero: Total Sessions */}
        <div id="session-counter" className="gsap-counter">
          <span className="text-display text-massive text-primary neon-text">
            {metrics.totalSessions}
          </span>
        </div>
        
        {/* Unit */}
        <p className="font-mono text-xl md:text-2xl text-foreground mt-4 tracking-wider">
          SESSIONS
        </p>
        
        {/* Stats Row */}
        <div className="flex gap-8 md:gap-16 mt-12">
          {/* Slot 2: Total Volume */}
          <div className="text-center">
            <p className="text-stat text-large text-foreground">{metrics.totalVolume}</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">TONS LIFTED</p>
          </div>
          
          <div className="w-px bg-border" />
          
          {/* Slot 3: Avg Sessions per Week */}
          <div className="text-center">
            <p className="text-stat text-large text-foreground">{metrics.avgSessionsPerWeek}</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">AVG / WEEK</p>
          </div>
          
          <div className="w-px bg-border" />
          
          {/* Slot 4: Hours Invested */}
          <div className="text-center">
            <p className="text-stat text-large text-primary">{metrics.hoursInvested}</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">HOURS</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrequencySlide;
