/**
 * Data Processor
 * Aggregates and processes workout data for visualization
 */

import { getMuscleGroup, MuscleGroup } from '@/data/exerciseMapping';

export interface WorkoutLog {
  date: string;
  workoutName: string;
  exerciseName: string;
  volume: number;
  reps: number;
  weight: number;
  [key: string]: any; // Allow additional properties
}

export interface OverallStats {
  totalVolume: number;
  uniqueCheckins: number;
  topPercentile: number; // 4% top performers
}

export interface VolumeByMuscle {
  name: string;
  value: number;
  color: string;
}

export interface HeatmapDataPoint {
  date: string;
  count: number;
}

export interface ActivityHeatmapPoint {
  date: string;
  count: number;
  intensity: number; // 0-4 based on set count thresholds
}

export interface ActivityHeatmapResult {
  heatmapData: ActivityHeatmapPoint[];
  startDate: string;
  endDate: string;
}

export interface PeakWeekdayStats {
  dayName: string;
  count: number;
  totalCheckins: number;
}

export interface WeekdayData {
  dayName: string;
  shortName: string;
  count: number;
  weekday: number; // 0=Sunday, 1=Monday, etc.
}

export interface WeekdayDistribution {
  peakDay: WeekdayData;
  orbitals: WeekdayData[]; // The other 6 days
}

// Color mapping for muscle groups (using neon green theme)
const muscleGroupColors: Record<MuscleGroup, string> = {
  Chest: '#CCFF00',
  Back: '#B8E600',
  Legs: '#A3CC00',
  Shoulders: '#8FB300',
  Arms: '#7A9900',
  Core: '#668000',
};

/**
 * Calculate overall statistics from workout logs
 */
export function getOverallStats(logs: WorkoutLog[]): OverallStats {
  // Sum total volume
  const totalVolume = logs.reduce((sum, log) => sum + (log.volume || 0), 0);
  
  // Count unique check-ins (based on date)
  const uniqueDates = new Set(logs.map(log => log.date));
  const uniqueCheckins = uniqueDates.size;
  
  // Calculate top percentile (4%)
  // This represents the user's performance compared to top 4% of users
  // For now, we'll use a simple calculation based on volume distribution
  const volumes = logs.map(log => log.volume || 0).filter(v => v > 0);
  if (volumes.length === 0) {
    return { totalVolume, uniqueCheckins, topPercentile: 0 };
  }
  
  volumes.sort((a, b) => b - a);
  const top4PercentIndex = Math.floor(volumes.length * 0.04);
  const topPercentile = top4PercentIndex > 0 ? volumes[top4PercentIndex] : volumes[0];
  
  return {
    totalVolume,
    uniqueCheckins,
    topPercentile,
  };
}

/**
 * Aggregate volume by muscle group
 * Returns data formatted for Recharts visualization
 */
export function getVolumeByMuscle(logs: WorkoutLog[]): VolumeByMuscle[] {
  const volumeMap = new Map<MuscleGroup, number>();
  
  // Iterate over all logs and sum volume by muscle group
  logs.forEach(log => {
    const muscleGroup = getMuscleGroup(log.exerciseName);
    const currentVolume = volumeMap.get(muscleGroup) || 0;
    volumeMap.set(muscleGroup, currentVolume + (log.volume || 0));
  });
  
  // Convert to array format for Recharts
  const result: VolumeByMuscle[] = Array.from(volumeMap.entries())
    .map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      color: muscleGroupColors[name],
    }))
    .sort((a, b) => b.value - a.value); // Sort by volume descending
  
  return result;
}

/**
 * Extract dates for calendar heatmap
 * Returns array of dates with workout counts
 */
export function getHeatmapData(logs: WorkoutLog[]): HeatmapDataPoint[] {
  const dateMap = new Map<string, number>();
  
  // Count workouts per date
  logs.forEach(log => {
    if (log.date) {
      const currentCount = dateMap.get(log.date) || 0;
      dateMap.set(log.date, currentCount + 1);
    }
  });
  
  // Convert to array format
  const result: HeatmapDataPoint[] = Array.from(dateMap.entries())
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date ascending
  
  return result;
}

/**
 * Get activity heatmap with intensity levels based on set count
 * Intensity is based on number of sets (logs) per day, not volume
 * 
 * Thresholds:
 * Level 0: 0 Sets (No Training)
 * Level 1: 1-8 Sets (Light Session)
 * Level 2: 9-16 Sets (Medium Session)
 * Level 3: 17-24 Sets (Heavy Session)
 * Level 4: 25+ Sets (Insane Grind)
 */
export function getActivityHeatmap(logs: WorkoutLog[]): ActivityHeatmapResult {
  // Safety: Return safe object even if logs are empty or invalid
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    return {
      heatmapData: [],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };
  }
  
  const dateMap = new Map<string, number>();
  const normalizedDates: string[] = [];
  
  // Count sets (logs) per date - normalize date to YYYY-MM-DD format
  logs.forEach(log => {
    if (log && log.date) {
      // Normalize date: extract YYYY-MM-DD part (remove time if present)
      // Use Optional Chaining to prevent crashes
      const normalizedDate = log.date?.split('T')[0]?.split(' ')[0] || '';
      if (normalizedDate) {
        normalizedDates.push(normalizedDate);
        const currentCount = dateMap.get(normalizedDate) || 0;
        dateMap.set(normalizedDate, currentCount + 1);
      }
    }
  });
  
  // Find min and max dates
  let startDate = '2024-01-01'; // Fallback
  let endDate = '2024-12-31'; // Fallback
  
  if (normalizedDates.length > 0) {
    const sortedDates = [...new Set(normalizedDates)].sort();
    startDate = sortedDates[0];
    endDate = sortedDates[sortedDates.length - 1];
  }
  
  // Convert to array with intensity levels
  const heatmapData: ActivityHeatmapPoint[] = Array.from(dateMap.entries())
    .map(([date, count]) => {
      // Determine intensity level based on set count
      let intensity = 0;
      if (count >= 25) {
        intensity = 4; // Insane Grind
      } else if (count >= 17) {
        intensity = 3; // Heavy Session
      } else if (count >= 9) {
        intensity = 2; // Medium Session
      } else if (count >= 1) {
        intensity = 1; // Light Session
      } else {
        intensity = 0; // No Training
      }
      
      return {
        date,
        count,
        intensity,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date ascending
  
  return {
    heatmapData,
    startDate,
    endDate,
  };
}

/**
 * Get top exercises by volume
 */
export function getTopExercises(logs: WorkoutLog[], limit: number = 10): Array<{ name: string; volume: number }> {
  const exerciseMap = new Map<string, number>();
  
  logs.forEach(log => {
    const currentVolume = exerciseMap.get(log.exerciseName) || 0;
    exerciseMap.set(log.exerciseName, currentVolume + (log.volume || 0));
  });
  
  return Array.from(exerciseMap.entries())
    .map(([name, volume]) => ({ name, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}

/**
 * Get workout frequency by month
 */
export function getMonthlyFrequency(logs: WorkoutLog[]): Array<{ month: string; count: number }> {
  const monthMap = new Map<string, number>();
  
  logs.forEach(log => {
    if (log.date) {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const currentCount = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, currentCount + 1);
    }
  });
  
  return Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get peak weekday (day with most workouts)
 * Counts unique check-ins per weekday (0=Sunday, 1=Monday, etc.)
 */
export function getPeakWeekday(logs: WorkoutLog[]): PeakWeekdayStats {
  // Get unique dates (one check-in per date)
  const uniqueDates = new Set(logs.map(log => log.date));
  const totalCheckins = uniqueDates.size;
  
  // Count workouts per weekday
  const weekdayCounts = new Map<number, number>();
  
  uniqueDates.forEach(dateStr => {
    const date = new Date(dateStr);
    const weekday = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    const currentCount = weekdayCounts.get(weekday) || 0;
    weekdayCounts.set(weekday, currentCount + 1);
  });
  
  // Find the weekday with the most workouts
  let peakWeekday = 0;
  let maxCount = 0;
  
  weekdayCounts.forEach((count, weekday) => {
    if (count > maxCount) {
      maxCount = count;
      peakWeekday = weekday;
    }
  });
  
  // Convert weekday number to day name
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayName = dayNames[peakWeekday];
  
  return {
    dayName,
    count: maxCount,
    totalCheckins,
  };
}

/**
 * Get weekday distribution with peak day and orbitals
 * Returns peak day and all other days sorted by count
 */
export function getWeekdayDistribution(logs: WorkoutLog[]): WeekdayDistribution {
  // Get unique dates (one check-in per date)
  const uniqueDates = new Set(logs.map(log => log.date));
  
  // Count workouts per weekday
  const weekdayCounts = new Map<number, number>();
  
  uniqueDates.forEach(dateStr => {
    const date = new Date(dateStr);
    const weekday = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    const currentCount = weekdayCounts.get(weekday) || 0;
    weekdayCounts.set(weekday, currentCount + 1);
  });
  
  // Day name mappings
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const shortNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Convert to array of WeekdayData
  const allDays: WeekdayData[] = Array.from(weekdayCounts.entries())
    .map(([weekday, count]) => ({
      dayName: dayNames[weekday],
      shortName: shortNames[weekday],
      count,
      weekday,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
  
  // Find peak day (first in sorted array)
  const peakDay = allDays[0] || {
    dayName: 'MONDAY',
    shortName: 'MON',
    count: 0,
    weekday: 1,
  };
  
  // Get orbitals (all other days)
  const orbitals = allDays.slice(1);
  
  // Fill in missing days with 0 count
  const existingWeekdays = new Set(allDays.map(d => d.weekday));
  for (let i = 0; i < 7; i++) {
    if (!existingWeekdays.has(i) && i !== peakDay.weekday) {
      orbitals.push({
        dayName: dayNames[i],
        shortName: shortNames[i],
        count: 0,
        weekday: i,
      });
    }
  }
  
  // Sort orbitals by weekday for consistent ordering
  orbitals.sort((a, b) => a.weekday - b.weekday);
  
  return {
    peakDay,
    orbitals,
  };
}

