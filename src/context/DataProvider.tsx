/**
 * Data Provider Context
 * Loads workout data and provides processed statistics to the app
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import workoutData from '@/data/clean_workouts.json';
import {
  getOverallStats,
  getVolumeByMuscle,
  getHeatmapData,
  getTopExercises,
  getMonthlyFrequency,
  getPeakWeekday,
  WorkoutLog,
  OverallStats,
  VolumeByMuscle,
  HeatmapDataPoint,
  PeakWeekdayStats,
} from '@/utils/dataProcessor';

export interface ProcessedData {
  rawLogs: WorkoutLog[];
  overallStats: OverallStats;
  volumeByMuscle: VolumeByMuscle[];
  heatmapData: HeatmapDataPoint[];
  topExercises: Array<{ name: string; volume: number }>;
  monthlyFrequency: Array<{ month: string; count: number }>;
  peakDayStats: PeakWeekdayStats;
}

interface DataContextType {
  data: ProcessedData | null;
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { data, isLoading, error } = useMemo(() => {
    try {
      // Type assertion: assume the JSON structure matches WorkoutLog[]
      const logs = workoutData as WorkoutLog[];
      
      // Validate that we have an array
      if (!Array.isArray(logs)) {
        return {
          data: null,
          isLoading: false,
          error: 'Invalid data format: expected array',
        };
      }
      
      // Process all data once
      const processedData: ProcessedData = {
        rawLogs: logs,
        overallStats: getOverallStats(logs),
        volumeByMuscle: getVolumeByMuscle(logs),
        heatmapData: getHeatmapData(logs),
        topExercises: getTopExercises(logs, 10),
        monthlyFrequency: getMonthlyFrequency(logs),
        peakDayStats: getPeakWeekday(logs),
      };
      
      return {
        data: processedData,
        isLoading: false,
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load workout data',
      };
    }
  }, []); // Empty dependency array - only run once on mount

  return (
    <DataContext.Provider value={{ data, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook to access workout data from context
 */
export function useWorkoutData() {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useWorkoutData must be used within a DataProvider');
  }
  
  return context;
}

