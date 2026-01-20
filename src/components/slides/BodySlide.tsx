import { useState, useCallback, useMemo } from 'react';
// @ts-ignore
import Model from 'react-body-highlighter';
import { RotateCcw } from 'lucide-react';
import { useWorkoutData } from '@/context/DataProvider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

// Minimum number of logs required to show an exercise in the dropdown
const MIN_LOGS_THRESHOLD = 3;

// Available muscle groups for accessibility dropdown
const MUSCLE_GROUP_OPTIONS = ['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS'] as const;

// Manual blacklist: Exercises to completely exclude from all calculations
const EXERCISE_BLACKLIST = [
  "Preacher curl (Barbell)",
  "Bent over Row (Barbell)",
  "Preacher Curl (Barbell)", // Case variation
  "Bent Over Row (Barbell)"  // Case variation
];

// 1. CLEAN SOURCE MAPPING (Only exercises from user's JSON data)
const EXERCISE_TO_GROUP: Record<string, string> = {
  // --- BACK ---
  "Lat Pulldown (Cable)": "BACK",
  "Seated Row (Machine)": "BACK",
  "Seated Row (Cable)": "BACK",
  "Bent Over One Arm Row (Dumbbell)": "BACK",
  "Bent Over Row (Barbell)": "BACK",
  "Pull Up (Assisted)": "BACK",
  "Lat Pulldown (Machine)": "BACK",
  "Back Extension (Machine)": "BACK",

  // --- CHEST ---
  "Chest Fly": "CHEST",
  "Incline Bench Press (Smith Machine)": "CHEST",
  "Bench Press (Barbell)": "CHEST",

  // --- SHOULDERS ---
  "Shoulder Press (Plate Loaded)": "SHOULDERS",
  "Lateral Raise (Machine)": "SHOULDERS",
  "Lateral Raise (Dumbbell)": "SHOULDERS",
  "Lateral Raise (Cable)": "SHOULDERS",
  "Reverse Fly (Machine)": "SHOULDERS",

  // --- ARMS ---
  "Hammer Curl (Dumbbell)": "ARMS",
  "Concentration Curl (Dumbbell)": "ARMS",
  "Incline Curl (Dumbbell)": "ARMS",
  "Preacher Curl (Machine)": "ARMS",
  "Preacher Curl (Barbell)": "ARMS",
  "Preacher Fitstar ": "ARMS",
  "Triceps Pushdown (Cable - Straight Bar)": "ARMS",
  "Triceps Extension": "ARMS",
  "Triceps Extension (Cable)": "ARMS",

  // --- LEGS ---
  "Leg Press": "LEGS",
  "Seated Leg Curl (Machine)": "LEGS",
  "Leg Extension (Machine)": "LEGS",
  "Hip Abductor (Machine)": "LEGS",
  "Beinpresse frei fitstar": "LEGS",

  // --- CORE ---
  "Bauchi": "CORE"
};

// 2. BODY MODEL GROUPING (Maps library muscles to UI groups)
const MUSCLE_GROUPS: Record<string, { group: string; muscles: string[] }> = {
  'trapezius': { group: 'BACK', muscles: ['trapezius', 'upper-back', 'lower-back', 'back-deltoids'] },
  'upper-back': { group: 'BACK', muscles: ['trapezius', 'upper-back', 'lower-back', 'back-deltoids'] },
  'lower-back': { group: 'BACK', muscles: ['trapezius', 'upper-back', 'lower-back', 'back-deltoids'] },
  'back-deltoids': { group: 'BACK', muscles: ['trapezius', 'upper-back', 'lower-back', 'back-deltoids'] },
  'chest': { group: 'CHEST', muscles: ['chest'] },
  'biceps': { group: 'ARMS', muscles: ['biceps', 'triceps', 'forearm'] },
  'triceps': { group: 'ARMS', muscles: ['biceps', 'triceps', 'forearm'] },
  'forearm': { group: 'ARMS', muscles: ['biceps', 'triceps', 'forearm'] },
  'front-deltoids': { group: 'SHOULDERS', muscles: ['front-deltoids'] },
  'quadriceps': { group: 'LEGS', muscles: ['quadriceps', 'hamstring', 'calves', 'gluteal', 'adductor', 'abductors', 'knees'] },
  'hamstring': { group: 'LEGS', muscles: ['quadriceps', 'hamstring', 'calves', 'gluteal'] },
  'calves': { group: 'LEGS', muscles: ['calves'] },
  'gluteal': { group: 'LEGS', muscles: ['gluteal'] },
  'abs': { group: 'CORE', muscles: ['abs', 'obliques'] },
  'obliques': { group: 'CORE', muscles: ['abs', 'obliques'] },
  'head': { group: 'HEAD', muscles: ['head', 'neck'] },
  'neck': { group: 'HEAD', muscles: ['head', 'neck'] }
};

// Helper: Calculate Estimated 1RM (Epley Formula)
const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  return weight * (1 + reps / 30);
};

// Helper: Calculate moving average
const movingAverage = (data: { timestamp: number; value: number }[], windowSize: number) => {
  return data.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = data.slice(start, index + 1);
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    return { ...point, value: Math.round(avg * 10) / 10 };
  });
};

// Helper: Format date to MMM format (e.g., "Jan", "Feb")
const formatMonthMMM = (timestamp: number): string => {
  const date = new Date(timestamp);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[date.getMonth()];
};

// Helper: Format date for tooltip (e.g., "Jan 15, 2024")
const formatTooltipDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper: Get ISO week start timestamp (Monday of that week)
const getISOWeekStart = (timestamp: number): number => {
  const date = new Date(timestamp);
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const weekStart = new Date(date.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
};

// Helper: Calculate median of an array
const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const BodySlide = () => {
  const { data } = useWorkoutData();
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('All Exercises');

  const toggleView = useCallback(() => {
    setView(prev => prev === 'anterior' ? 'posterior' : 'anterior');
  }, []);

  // Handler for accessibility dropdown (zero-layout-impact)
  const handleGroupSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSelectedGroup(null);
      setSelectedExercise('All Exercises');
    } else {
      setSelectedGroup(value);
      setSelectedExercise('All Exercises');
    }
  }, []);

  const handleClick = useCallback(({ muscle }: { muscle: string }) => {
    const mapping = MUSCLE_GROUPS[muscle];
    if (mapping && mapping.group === selectedGroup) {
      setSelectedGroup(null);
      setSelectedExercise('All Exercises');
    } else if (mapping) {
      setSelectedGroup(mapping.group);
      setSelectedExercise('All Exercises');
    } else {
      setSelectedGroup(muscle);
      setSelectedExercise('All Exercises');
    }
  }, [selectedGroup]);

  // DATA PROP: Tells the library which muscles are active
  const modelData = useMemo(() => {
    if (!selectedGroup) return [];
    const groupDef = Object.values(MUSCLE_GROUPS).find(g => g.group === selectedGroup);
    return [{ name: selectedGroup, muscles: groupDef ? groupDef.muscles : [selectedGroup] }];
  }, [selectedGroup]);

  // 3. FILTER LOGS BY SELECTED GROUP + BLACKLIST (Pre-processing)
  const groupLogs = useMemo(() => {
    if (!selectedGroup || !data?.rawLogs) return [];
    
    return data.rawLogs.filter(log => {
      // Apply blacklist first
      if (EXERCISE_BLACKLIST.some(blacklisted => 
        log.exerciseName.toLowerCase().includes(blacklisted.toLowerCase())
      )) {
        return false;
      }
      
      // Then filter by group
      const exerciseGroup = EXERCISE_TO_GROUP[log.exerciseName];
      return exerciseGroup === selectedGroup;
    });
  }, [selectedGroup, data?.rawLogs]);

  // 4. EXTRACT UNIQUE EXERCISES WITH SPARSE DATA FILTERING
  const { availableExercises, exerciseLogCounts } = useMemo(() => {
    // Count logs per exercise
    const counts = new Map<string, number>();
    groupLogs.forEach(log => {
      const current = counts.get(log.exerciseName) || 0;
      counts.set(log.exerciseName, current + 1);
    });

    // Filter out exercises with too few logs
    const validExercises = Array.from(counts.entries())
      .filter(([, count]) => count >= MIN_LOGS_THRESHOLD)
      .map(([name]) => name)
      .sort();

    return {
      availableExercises: ['All Exercises', ...validExercises],
      exerciseLogCounts: counts
    };
  }, [groupLogs]);

  // Reset selected exercise if it's no longer available
  useMemo(() => {
    if (selectedExercise !== 'All Exercises' && !availableExercises.includes(selectedExercise)) {
      // This will trigger on next render - we need useEffect for side effects
    }
  }, [availableExercises, selectedExercise]);

  // 5. CHART DATA PREPARATION (Dual Mode with Dynamic Time Domain)
  const { chartData, chartMode, yAxisLabel, domainMin, domainMax } = useMemo(() => {
    const isSpecificExercise = selectedExercise !== 'All Exercises';

    if (isSpecificExercise) {
      // MODE A: Estimated 1RM with 5-day Moving Average (Dynamic Timeline)
      // LOGIC: Keep existing - it's correct
      const exerciseLogs = groupLogs
        .filter(log => log.exerciseName === selectedExercise)
        .map(log => ({
          date: log.date,
          timestamp: new Date(log.date).getTime(),
          value: calculate1RM(log.weight || 0, log.reps || 0)
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => a.timestamp - b.timestamp);

      // Get daily max 1RM
      const dailyMax = new Map<string, { timestamp: number; value: number }>();
      exerciseLogs.forEach(log => {
        const dateKey = log.date.split('T')[0];
        const existing = dailyMax.get(dateKey);
        if (!existing || log.value > existing.value) {
          dailyMax.set(dateKey, { timestamp: log.timestamp, value: log.value });
        }
      });

      const dailyData = Array.from(dailyMax.values())
        .sort((a, b) => a.timestamp - b.timestamp);

      // Apply 5-day moving average
      const smoothedData = movingAverage(dailyData, 5);

      // Calculate dynamic domain
      const timestamps = smoothedData.map(d => d.timestamp);
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);

      return {
        chartData: smoothedData,
        chartMode: 'A' as const,
        yAxisLabel: 'Est. 1RM (kg)',
        domainMin: minTime,
        domainMax: maxTime
      };

    } else {
      // MODE B: Percentage GAIN (D3-style algorithm with negative clamping)
      if (groupLogs.length === 0) {
        return {
          chartData: [],
          chartMode: 'B' as const,
          yAxisLabel: 'Strength Gain (%)',
          domainMin: 0,
          domainMax: 0
        };
      }

      // Find overall date range
      const allTimestamps = groupLogs.map(log => new Date(log.date).getTime());
      const minTime = Math.min(...allTimestamps);
      const maxTime = Math.max(...allTimestamps);

      // Group logs by exercise
      const exerciseGroups = new Map<string, typeof groupLogs>();
      groupLogs.forEach(log => {
        if (!exerciseGroups.has(log.exerciseName)) {
          exerciseGroups.set(log.exerciseName, []);
        }
        exerciseGroups.get(log.exerciseName)!.push(log);
      });

      // For each exercise, calculate weekly percentages independently
      const exerciseWeeklyPercentages = new Map<string, Array<{ weekStart: number; percentage: number }>>();

      exerciseGroups.forEach((logs, exerciseName) => {
        if (logs.length < MIN_LOGS_THRESHOLD) return;

        // STEP A: Group by ISO Week and find Max 1RM per week
        const weeklyMax1RM = new Map<number, number>(); // weekStart -> max 1RM

        logs.forEach(log => {
          const logTimestamp = new Date(log.date).getTime();
          const weekStart = getISOWeekStart(logTimestamp);
          const current1RM = calculate1RM(log.weight || 0, log.reps || 0);

          if (current1RM <= 0) return;

          const existingMax = weeklyMax1RM.get(weekStart) || 0;
          if (current1RM > existingMax) {
            weeklyMax1RM.set(weekStart, current1RM);
          }
        });

        if (weeklyMax1RM.size === 0) return;

        // Convert to sorted array
        const weeklyData = Array.from(weeklyMax1RM.entries())
          .map(([weekStart, max1RM]) => ({ weekStart, max1RM }))
          .sort((a, b) => a.weekStart - b.weekStart);

        // STEP B: Determine Baseline (Week 0's max 1RM)
        const base = weeklyData[0].max1RM;
        if (base <= 0) return;

        // STEP C: Calculate Relative Percentage for each week
        // Formula: ((weeklyMax1RM / base) - 1) * 100
        // STEP D: Clamp negatives to 0 (User requirement)
        const weeklyPercentages = weeklyData.map(week => {
          const calculatedPercent = ((week.max1RM / base) - 1) * 100;
          const clampedPercent = Math.max(0, calculatedPercent); // Prevent negative values
          return {
            weekStart: week.weekStart,
            percentage: clampedPercent
          };
        });

        exerciseWeeklyPercentages.set(exerciseName, weeklyPercentages);
      });

      // AGGREGATION: Combine exercises using MEDIAN per week
      // Collect all unique weeks
      const allWeeks = new Set<number>();
      exerciseWeeklyPercentages.forEach(weeklyData => {
        weeklyData.forEach(week => {
          allWeeks.add(week.weekStart);
        });
      });

      // For each week, collect percentages from all exercises and calculate MEDIAN
      const weeklyGains = new Map<number, number[]>(); // weekStart -> array of percentages

      exerciseWeeklyPercentages.forEach(weeklyData => {
        weeklyData.forEach(week => {
          if (!weeklyGains.has(week.weekStart)) {
            weeklyGains.set(week.weekStart, []);
          }
          weeklyGains.get(week.weekStart)!.push(week.percentage);
        });
      });

      // Calculate MEDIAN for each week
      const chartData = Array.from(weeklyGains.entries())
        .map(([weekStart, percentages]) => {
          const medianPercentage = calculateMedian(percentages);
          return {
            timestamp: weekStart,
            value: Math.round(medianPercentage * 10) / 10
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp);

      const dataTimestamps = chartData.map(d => d.timestamp);
      const dataMinTime = dataTimestamps.length > 0 ? Math.min(...dataTimestamps) : minTime;
      const dataMaxTime = dataTimestamps.length > 0 ? Math.max(...dataTimestamps) : maxTime;

      return {
        chartData,
        chartMode: 'B' as const,
        yAxisLabel: 'Strength Gain (%)',
        domainMin: dataMinTime,
        domainMax: dataMaxTime
      };
    }
  }, [groupLogs, selectedExercise]);

  // 6. QUICK STATS
  const stats = useMemo(() => {
    const logsToProcess = selectedExercise === 'All Exercises'
      ? groupLogs
      : groupLogs.filter(log => log.exerciseName === selectedExercise);

    const totalVolume = logsToProcess.reduce((sum, log) => sum + (log.volume || 0), 0);
    const uniqueSessions = new Set(logsToProcess.map(log => log.date.split('T')[0])).size;

    // Calculate max 1RM for the selection
    let max1RM = 0;
    logsToProcess.forEach(log => {
      const rm = calculate1RM(log.weight || 0, log.reps || 0);
      if (rm > max1RM) max1RM = rm;
    });

    return {
      totalVolume: totalVolume > 1000000 
        ? `${(totalVolume / 1000000).toFixed(1)}M` 
        : totalVolume > 1000 
          ? `${(totalVolume / 1000).toFixed(0)}K`
          : totalVolume.toString(),
      sessions: uniqueSessions,
      max1RM: max1RM > 0 ? `${Math.round(max1RM)}kg` : '--'
    };
  }, [groupLogs, selectedExercise]);

  const hasData = chartData.length > 0 && chartData.some(d => d.value !== undefined);

  // Calculate sparse exercises count for info display
  const sparseExercisesCount = useMemo(() => {
    let count = 0;
    exerciseLogCounts.forEach((logCount) => {
      if (logCount < MIN_LOGS_THRESHOLD) count++;
    });
    return count;
  }, [exerciseLogCounts]);

  return (
    <section className="section-slide bg-gradient-slide-9 noise overflow-hidden">
      {/* CSS for hover & active states */}
      <style>{`
        /* BASE STATE: Dark polygons */
        .body-model-container svg polygon,
        .body-model-container svg path {
          fill: #2C2C2C;
          fill-opacity: 0.85;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        
        /* HOVER STATE: Outline Only (on dark elements) */
        .body-model-container svg polygon:not([fill="#CCFF00"]):hover,
        .body-model-container svg path:not([fill="#CCFF00"]):hover {
          stroke: #CCFF00 !important;
          stroke-width: 2px !important;
          filter: drop-shadow(0 0 4px #CCFF00);
        }
        
        /* ACTIVE STATE: Target polygons FILLED with Neon by the library */
        .body-model-container svg polygon[fill="#CCFF00"],
        .body-model-container svg path[fill="#CCFF00"],
        .body-model-container svg polygon[style*="rgb(204, 255, 0)"] {
          fill-opacity: 1 !important;
          stroke: #FFFFFF;
          stroke-width: 1.5px;
          filter: drop-shadow(0 0 15px rgba(204, 255, 0, 0.7)) drop-shadow(0 0 30px rgba(204, 255, 0, 0.4));
        }
      `}</style>

      {/* MAIN CONTAINER managing the split layout */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="relative w-full max-w-7xl h-full flex items-center justify-center">

          {/* LEFT SIDE: BODY MODEL */}
          {/* Mobile: Hide when selected. Desktop: Always visible (side-by-side) */}
          <div className={`
            ${selectedGroup ? 'hidden lg:flex' : 'flex'}
            flex-col items-center justify-center z-20
            transition-all duration-700 ease-in-out transform
            ${selectedGroup ? 'lg:-translate-x-[20%] lg:scale-90' : 'lg:translate-x-0 lg:scale-100'}
          `}>
            {/* Header */}
            <div className="relative text-center mb-2 w-full">
              {/* Accessibility Dropdown: Zero-Layout-Impact on Desktop */}
              <label htmlFor="muscle-group-select" className="sr-only">
                Select muscle group to analyze
              </label>
              <select
                id="muscle-group-select"
                value={selectedGroup || ''}
                onChange={handleGroupSelect}
                aria-label="Select muscle group"
                className={`
                  w-full mb-2 block mt-20 lg:mt-0
                  lg:absolute lg:top-36 lg:left-1/2 lg:-translate-x-1/2 lg:w-auto lg:min-w-[200px]
                  lg:opacity-0 lg:pointer-events-none
                  lg:focus:opacity-100 lg:focus:pointer-events-auto lg:focus:z-50
                  bg-white/5 border border-white/10 rounded-lg px-4 py-3
                  font-mono text-sm text-white/80
                  focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00]
                  cursor-pointer touch-target
                  transition-opacity duration-200
                `}
              >
                <option value="">None Selected</option>
                {MUSCLE_GROUP_OPTIONS.map(group => (
                  <option key={group} value={group} className="bg-black text-white">
                    {group}
                  </option>
                ))}
              </select>

              <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-1">
                <span className="text-primary neon-text">THE BODY</span>
              </h2>
              <p className="font-mono text-gray-400 tracking-widest uppercase text-sm">
                {selectedGroup ? `SELECTED: ${selectedGroup}` : 'SELECT A MUSCLE GROUP'}
              </p>

              {/* Screen Reader Note */}
              <p className="sr-only">
                Visual body map. Use the dropdown menu above to select muscle groups, or click directly on the body model.
              </p>
            </div>

            {/* Model Container */}
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="relative bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl body-model-container">
                <Model
                  type={view}
                  data={modelData}
                  highlightedColors={['#CCFF00', '#CCFF00']}
                  onClick={handleClick}
                  style={{ width: '200px', height: '450px' }}
                />

                <button
                  onClick={toggleView}
                  aria-label={`Flip body model to ${view === 'anterior' ? 'posterior' : 'anterior'} view`}
                  className="absolute bottom-6 right-6 p-3 rounded-full bg-black/50 hover:bg-[#CCFF00]/20 border border-white/10 hover:border-[#CCFF00] transition-all group focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50"
                >
                  <RotateCcw className="w-5 h-5 text-gray-400 group-hover:text-[#CCFF00] transition-colors group-hover:-rotate-180 duration-500" aria-hidden="true" />
                </button>
              </div>

              {/* Info Panel */}
              <div className="flex flex-col gap-4 min-w-[150px]">
                <p className="font-mono text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">
                  {view.toUpperCase()} VIEW
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-sm bg-[#CCFF00] ${selectedGroup ? 'opacity-100 shadow-[0_0_8px_#CCFF00]' : 'opacity-25'}`} />
                  <span className={`font-mono text-sm ${selectedGroup ? 'text-white' : 'text-white/50'}`}>
                    {selectedGroup || 'HOVER / CLICK'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: CHART PANEL */}
          {/* Mobile: Show only when selected (Focus View). Desktop: Visible with opacity transition */}
          <div className={`
            ${selectedGroup ? 'flex flex-col w-full h-full' : 'hidden lg:flex'}
            lg:w-[45%] lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:h-full
            items-center justify-center z-10
            transition-all duration-700 ease-in-out
            ${!selectedGroup ? 'lg:opacity-0 lg:pointer-events-none lg:translate-x-[20px]' : 'lg:opacity-100 lg:pointer-events-auto lg:translate-x-0'}
          `}>
            {/* Conditionally render content to avoid flash on desktop */}
            {selectedGroup ? (
              <div 
                className="w-full max-w-md h-full lg:h-[540px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col"
                role="img"
                aria-label={`Strength progress chart for ${selectedGroup}. See stats below for details.`}
              >
              {/* Chart Header */}
              <div className="mb-4">
                {/* Mobile: Back Button */}
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="lg:hidden mb-3 flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-[#CCFF00] transition-colors touch-target"
                  aria-label="Back to body selection"
                >
                  <span className="text-lg">←</span>
                  <span>Back to Selection</span>
                </button>

                <h3 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-tight">
                  {selectedGroup} <span className="text-[#CCFF00]">ANALYSIS</span>
                </h3>
                
                {/* Exercise Dropdown */}
                <label htmlFor="exercise-select" className="sr-only">
                  Select exercise to analyze
                </label>
                <select
                  id="exercise-select"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white/80 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] cursor-pointer touch-target"
                >
                  {availableExercises.map(ex => (
                    <option key={ex} value={ex} className="bg-black text-white">
                      {ex}
                    </option>
                  ))}
                </select>

                {/* Mode Indicator & Sparse Data Info */}
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] text-gray-500">
                    {chartMode === 'A' 
                      ? '📈 Est. 1RM (5-day avg)' 
                      : '📊 Strength Gain (%)'}
                  </p>
                  {sparseExercisesCount > 0 && (
                    <p className="font-mono text-[10px] text-gray-600">
                      {sparseExercisesCount} exercise{sparseExercisesCount > 1 ? 's' : ''} hidden ({"<"}{MIN_LOGS_THRESHOLD} logs)
                    </p>
                  )}
                </div>
              </div>

              {/* Chart Area - Explicit height for mobile ResponsiveContainer */}
              <div className="flex-1 h-[250px] lg:h-full lg:min-h-0">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorNeon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="timestamp" 
                        type="number"
                        scale="time"
                        domain={[domainMin, domainMax]}
                        tickFormatter={(ts) => formatMonthMMM(ts as number)}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        label={{ 
                          value: yAxisLabel, 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9 }
                        }}
                        domain={chartMode === 'B' ? [0, 'auto'] : ['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(204,255,0,0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#CCFF00', fontFamily: 'monospace', fontSize: '12px' }}
                        itemStyle={{ color: 'white', fontFamily: 'monospace', fontSize: '11px' }}
                        labelFormatter={(ts) => formatTooltipDate(ts as number)}
                        formatter={(value: number) => [
                          chartMode === 'A' 
                            ? `${value.toFixed(1)} kg` 
                            : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`,
                          chartMode === 'A' ? 'Est. 1RM' : 'Gain'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#CCFF00" 
                        strokeWidth={2}
                        fill="url(#colorNeon)" 
                        connectNulls={true}
                        dot={chartMode === 'A' && chartData.length < 15}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                    <div className="text-center">
                      <p className="text-white/30 font-mono text-sm">NO DATA FOR {selectedGroup}</p>
                      <p className="text-white/20 font-mono text-xs mt-2">
                        {selectedExercise !== 'All Exercises' 
                          ? `"${selectedExercise}" has insufficient data points`
                          : 'Try selecting a different muscle group'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="font-mono text-[10px] text-gray-500">VOLUME</p>
                  <p className="font-display text-lg font-bold text-white">{stats.totalVolume}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="font-mono text-[10px] text-gray-500">SESSIONS</p>
                  <p className="font-display text-lg font-bold text-white">{stats.sessions}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="font-mono text-[10px] text-gray-500">MAX 1RM</p>
                  <p className="font-display text-lg font-bold text-[#CCFF00]">{stats.max1RM}</p>
                </div>
              </div>
            </div>
            ) : null}
          </div>

        </div>
      </div>
    </section>
  );
};

export default BodySlide;
