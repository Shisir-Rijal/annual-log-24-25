import { useState, useMemo } from 'react';
// @ts-ignore
import Model from 'react-body-highlighter';
import { RotateCcw } from 'lucide-react';
import { useWorkoutData } from '@/context/DataProvider';

// 1. SAFE MUSCLES PER VIEW (No knees, no soleus to prevent crashes)
const VALID_MUSCLES_BY_VIEW = {
  anterior: new Set([
    'chest', 'abs', 'obliques', 'biceps', 'triceps', 'forearm',
    'front-deltoids', 'quadriceps', 'abductors', 'adductor',
    'head', 'neck'
    // 'calves' removed from anterior to be safe, add back if supported
  ]),
  posterior: new Set([
    'trapezius', 'upper-back', 'lower-back', 'back-deltoids',
    'triceps', 'forearm', 'gluteal', 'hamstring', 'calves',
    'head', 'neck'
  ])
};

// 2. MAPPING EXERCISES TO SAFE SLUGS
const EXERCISE_TO_LIBRARY_MUSCLES: Record<string, string[]> = {
  'bench press': ['chest', 'triceps', 'front-deltoids'],
  'push up': ['chest', 'triceps', 'front-deltoids'],
  'fly': ['chest'],
  'lat pulldown': ['upper-back', 'biceps'],
  'pull up': ['upper-back', 'biceps'],
  'row': ['upper-back', 'back-deltoids', 'biceps'],
  'deadlift': ['lower-back', 'gluteal', 'hamstring', 'trapezius'],
  'squat': ['quadriceps', 'gluteal', 'hamstring'],
  'leg press': ['quadriceps', 'gluteal'],
  'extension': ['quadriceps'],
  'leg curl': ['hamstring'],
  'shoulder press': ['front-deltoids', 'triceps'],
  'lateral raise': ['front-deltoids'],
  'face pull': ['back-deltoids', 'trapezius'],
  'curl': ['biceps'],
  'tricep': ['triceps'],
  'dip': ['triceps', 'chest'],
  'plank': ['abs', 'obliques'],
  'crunch': ['abs'],
  'calf': ['calves']
};

const normalizeName = (name: string) => name.toLowerCase().trim();

// 3. DYNAMIC FILTER FUNCTION
const getSafeMuscles = (exerciseName: string, view: 'anterior' | 'posterior') => {
  const norm = normalizeName(exerciseName);
  let muscles: string[] = [];

  // Lookup
  if (EXERCISE_TO_LIBRARY_MUSCLES[norm]) {
    muscles = EXERCISE_TO_LIBRARY_MUSCLES[norm];
  } else {
    for (const [key, val] of Object.entries(EXERCISE_TO_LIBRARY_MUSCLES)) {
      if (norm.includes(key)) {
        muscles = val;
        break;
      }
    }
  }

  // CRITICAL: Filter based on current VIEW
  const allowed = VALID_MUSCLES_BY_VIEW[view];
  return muscles.filter(m => allowed.has(m));
};

const BodySlide = () => {
  const { data, isLoading } = useWorkoutData();
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');

  const toggleView = () => setView(prev => prev === 'anterior' ? 'posterior' : 'anterior');

  const muscleData = useMemo(() => {
    const logs = data?.rawLogs || [];
    if (!Array.isArray(logs)) return { modelData: [], topMuscles: [] };

    // PREPARE DATA - RE-RUNS WHEN VIEW CHANGES
    const modelData = logs
      .map((log: any) => {
        const name = log.exerciseName || log['Exercise Name'] || log.workoutName;
        if (!name) return null;

        // Pass 'view' to filter logic!
        const muscles = getSafeMuscles(name.toString(), view);

        if (muscles.length === 0) return null;
        return { name: name.toString(), muscles };
      })
      .filter((i): i is { name: string; muscles: string[] } => i !== null);

    // DEBUGGING LOG
    // console.log(`[${view.toUpperCase()}] Muscles passed:`, Array.from(new Set(modelData.flatMap(d => d.muscles))));

    // TOP 3 STATS
    const counts = new Map<string, number>();
    modelData.forEach(d => d.muscles.forEach(m => counts.set(m, (counts.get(m) || 0) + 1)));
    const topMuscles = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count], i) => ({
        name: name.toUpperCase().replace(/-/g, ' '),
        intensity: 1 - (i * 0.2)
      }));

    return { modelData, topMuscles };
  }, [data, view]); // Depend on VIEW so we re-filter immediately

  if (isLoading) {
    return (
      <section className="section-slide bg-gradient-slide-9 noise">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-sm text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-slide bg-gradient-slide-9 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <h2 className="text-display text-large text-center mb-2">
          <span className="text-foreground">THE</span>
          <span className="text-primary neon-text"> BODY</span>
        </h2>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          MUSCLES WORKED THIS YEAR
        </p>

        <div className="relative flex flex-col md:flex-row items-center gap-12 z-10">
          {/* Top List */}
          {muscleData.topMuscles.length > 0 && (
            <div className="flex flex-col gap-4 min-w-[150px]">
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">Top Focus ({view})</p>
              {muscleData.topMuscles.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-sm bg-[#CCFF00]" style={{ opacity: m.intensity }} />
                  <span className="font-mono text-sm text-white">{m.name}</span>
                </div>
              ))}
            </div>
          )}
          {/* Model */}
          <div className="relative bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl">
            <Model
              type={view}
              data={muscleData.modelData}
              bodyColor="#1a1a1a"
              highlightedColors={['rgba(204, 255, 0, 0.2)', '#CCFF00']}
              style={{ width: '200px', height: '450px' }}
            />
            <button onClick={toggleView} className="absolute bottom-6 right-6 p-3 rounded-full bg-black/50 hover:bg-[#CCFF00]/20 border border-white/10 hover:border-[#CCFF00] transition-all group">
              <RotateCcw className="w-5 h-5 text-gray-400 group-hover:text-[#CCFF00]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BodySlide;
