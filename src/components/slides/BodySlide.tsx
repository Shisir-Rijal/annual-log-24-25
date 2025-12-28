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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Helper: Calculate Estimated 1RM (Epley Formula)
const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  return weight * (1 + reps / 30);
};

// Helper: Calculate moving average
const movingAverage = (data: { date: string; value: number }[], windowSize: number) => {
  return data.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = data.slice(start, index + 1);
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    return { ...point, value: Math.round(avg * 10) / 10 };
  });
};

const BodySlide = () => {
  const { data } = useWorkoutData();
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('All Exercises');

  const toggleView = useCallback(() => {
    setView(prev => prev === 'anterior' ? 'posterior' : 'anterior');
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

  // 3. FILTER LOGS BY SELECTED GROUP (Strict mapping)
  const groupLogs = useMemo(() => {
    if (!selectedGroup || !data?.rawLogs) return [];
    
    return data.rawLogs.filter(log => {
      const exerciseGroup = EXERCISE_TO_GROUP[log.exerciseName];
      return exerciseGroup === selectedGroup;
    });
  }, [selectedGroup, data?.rawLogs]);

  // 4. EXTRACT UNIQUE EXERCISES (only from filtered logs)
  const uniqueExercises = useMemo(() => {
    const exercises = new Set(groupLogs.map(log => log.exerciseName));
    return ['All Exercises', ...Array.from(exercises).sort()];
  }, [groupLogs]);

  // 5. CHART DATA PREPARATION (Dual Mode)
  const { chartData, chartMode, yAxisLabel } = useMemo(() => {
    const isSpecificExercise = selectedExercise !== 'All Exercises';

    if (isSpecificExercise) {
      // MODE A: Estimated 1RM with 5-day Moving Average
      const exerciseLogs = groupLogs
        .filter(log => log.exerciseName === selectedExercise)
        .map(log => ({
          date: log.date,
          value: calculate1RM(log.weight || 0, log.reps || 0)
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Get daily max 1RM
      const dailyMax = new Map<string, number>();
      exerciseLogs.forEach(log => {
        const existing = dailyMax.get(log.date) || 0;
        if (log.value > existing) {
          dailyMax.set(log.date, log.value);
        }
      });

      const dailyData = Array.from(dailyMax.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Apply 5-day moving average
      const smoothedData = movingAverage(dailyData, 5);

      // Format for chart (use month abbreviation for display)
      const formattedData = smoothedData.map(d => ({
        label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: d.value
      }));

      return {
        chartData: formattedData.slice(-20), // Last 20 data points
        chartMode: 'A' as const,
        yAxisLabel: 'Est. 1RM (kg)'
      };

    } else {
      // MODE B: Relative Strength Index (%)
      // Group logs by exercise
      const exerciseGroups = new Map<string, typeof groupLogs>();
      groupLogs.forEach(log => {
        if (!exerciseGroups.has(log.exerciseName)) {
          exerciseGroups.set(log.exerciseName, []);
        }
        exerciseGroups.get(log.exerciseName)!.push(log);
      });

      // Calculate baseline (first session) and relative % for each exercise
      const monthlyStrengthIndex = MONTHS.map(() => ({ values: [] as number[] }));

      exerciseGroups.forEach((logs) => {
        // Sort by date to find baseline
        const sortedLogs = [...logs].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (sortedLogs.length === 0) return;

        // Baseline = 1RM of first session
        const baseline1RM = calculate1RM(sortedLogs[0].weight || 0, sortedLogs[0].reps || 0);
        if (baseline1RM <= 0) return;

        // Calculate % for each log
        sortedLogs.forEach(log => {
          const current1RM = calculate1RM(log.weight || 0, log.reps || 0);
          const percentage = (current1RM / baseline1RM) * 100;
          const monthIndex = new Date(log.date).getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyStrengthIndex[monthIndex].values.push(percentage);
          }
        });
      });

      // Average % per month
      const chartData = MONTHS.map((month, index) => {
        const values = monthlyStrengthIndex[index].values;
        const avg = values.length > 0 
          ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          : 0;
        return { label: month, value: avg };
      });

      return {
        chartData,
        chartMode: 'B' as const,
        yAxisLabel: 'Strength Index (%)'
      };
    }
  }, [groupLogs, selectedExercise]);

  // 6. QUICK STATS
  const stats = useMemo(() => {
    const logsToProcess = selectedExercise === 'All Exercises'
      ? groupLogs
      : groupLogs.filter(log => log.exerciseName === selectedExercise);

    const totalVolume = logsToProcess.reduce((sum, log) => sum + (log.volume || 0), 0);
    const uniqueSessions = new Set(logsToProcess.map(log => log.date)).size;

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

  const hasData = chartData.some(d => d.value > 0);

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
          <div className={`
            transition-all duration-700 ease-in-out transform
            ${selectedGroup ? '-translate-x-[15%] scale-90 md:-translate-x-[20%]' : 'translate-x-0 scale-100'}
            flex flex-col items-center justify-center z-20
          `}>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter mb-2">
                THE <span className="text-[#CCFF00]">BODY</span>
              </h2>
              <p className="font-mono text-gray-400 tracking-widest uppercase text-sm">
                {selectedGroup ? `SELECTED: ${selectedGroup}` : 'SELECT A MUSCLE GROUP'}
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
                  className="absolute bottom-6 right-6 p-3 rounded-full bg-black/50 hover:bg-[#CCFF00]/20 border border-white/10 hover:border-[#CCFF00] transition-all group"
                >
                  <RotateCcw className="w-5 h-5 text-gray-400 group-hover:text-[#CCFF00] transition-colors group-hover:-rotate-180 duration-500" />
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
          <div className={`
            absolute right-0 top-0 bottom-0 w-[45%] h-full 
            flex items-center justify-center z-10 
            transition-all duration-700 ease-in-out
            ${selectedGroup 
              ? 'opacity-100 translate-x-0 pointer-events-auto' 
              : 'opacity-0 translate-x-[100px] pointer-events-none'}
          `}>
            <div className="w-full max-w-md h-[540px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col">
              {/* Chart Header */}
              <div className="mb-4">
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
                  {selectedGroup} <span className="text-[#CCFF00]">ANALYSIS</span>
                </h3>
                
                {/* Exercise Dropdown */}
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white/80 focus:outline-none focus:border-[#CCFF00] cursor-pointer"
                >
                  {uniqueExercises.map(ex => (
                    <option key={ex} value={ex} className="bg-black text-white">
                      {ex}
                    </option>
                  ))}
                </select>

                {/* Mode Indicator */}
                <p className="mt-2 font-mono text-[10px] text-gray-500">
                  {chartMode === 'A' 
                    ? '📈 Showing: Est. 1RM (5-day moving avg)' 
                    : '📊 Showing: Group Strength Index vs Baseline'}
                </p>
              </div>

              {/* Chart Area */}
              <div className="flex-1 min-h-0">
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
                        dataKey="label" 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        interval={chartMode === 'A' ? 'preserveStartEnd' : 0}
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
                        formatter={(value: number) => [
                          chartMode === 'A' 
                            ? `${value.toFixed(1)} kg` 
                            : `${value}%`,
                          chartMode === 'A' ? 'Est. 1RM' : 'Strength Index'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#CCFF00" 
                        strokeWidth={2}
                        fill="url(#colorNeon)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                    <div className="text-center">
                      <p className="text-white/30 font-mono text-sm">NO DATA FOR {selectedGroup}</p>
                      <p className="text-white/20 font-mono text-xs mt-2">Try selecting a different muscle group</p>
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
          </div>

        </div>
      </div>
    </section>
  );
};

export default BodySlide;
