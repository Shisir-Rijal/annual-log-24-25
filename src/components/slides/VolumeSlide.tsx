import { useMemo } from 'react';
import { useWorkoutData } from '../../context/DataProvider';

// EXACT exercise name to muscle group mapping
const EXERCISE_TO_MUSCLE: Record<string, string> = {
  // CHEST
  'Chest Fly': 'CHEST',
  'Incline Bench Press (Smith Machine)': 'CHEST',
  'Bench Press (Barbell)': 'CHEST',

  // BACK
  'Lat Pulldown (Cable)': 'BACK',
  'Seated Row (Machine)': 'BACK',
  'Bent Over One Arm Row (Dumbbell)': 'BACK',
  'Back Extension (Machine)': 'BACK',
  'Lat Pulldown (Machine)': 'BACK',
  'Seated Row (Cable)': 'BACK',
  'Pull Up (Assisted)': 'BACK',
  'Bent Over Row (Barbell)': 'BACK',

  // LEGS
  'Leg Press': 'LEGS',
  'Seated Leg Curl (Machine)': 'LEGS',
  'Leg Extension (Machine)': 'LEGS',
  'Hip Abductor (Machine)': 'LEGS',

  // ARMS
  'Hammer Curl (Dumbbell)': 'ARMS',
  'Concentration Curl (Dumbbell)': 'ARMS',
  'Triceps Pushdown (Cable - Straight Bar)': 'ARMS',
  'Triceps Extension': 'ARMS',
  'Incline Curl (Dumbbell)': 'ARMS',
  'Preacher Curl (Barbell)': 'ARMS',
  'Preacher Curl (Machine)': 'ARMS',

  // SHOULDERS
  'Shoulder Press (Plate Loaded)': 'SHOULDERS',
  'Lateral Raise (Machine)': 'SHOULDERS',
  'Lateral Raise (Dumbbell)': 'SHOULDERS',
  'Lateral Raise (Cable)': 'SHOULDERS',
  'Reverse Fly (Machine)': 'SHOULDERS',
};

const getMuscleGroup = (exerciseName: string): string | null => {
  const group = EXERCISE_TO_MUSCLE[exerciseName];
  if (!group) {
    console.warn('[VolumeSlide] Unknown exercise:', exerciseName);
    return null;
  }
  return group;
};

const formatVolume = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

const VolumeSlide = () => {
  const { data } = useWorkoutData();

  const volumeData = useMemo(() => {
    const logs = data?.rawLogs || [];

    const totals: Record<string, number> = {
      CHEST: 0,
      BACK: 0,
      LEGS: 0,
      ARMS: 0,
      SHOULDERS: 0,
    };

    logs.forEach((log) => {
      const group = getMuscleGroup(log.exerciseName);
      if (group && totals[group] !== undefined) {
        const weight = Number(log.weight) || 0;
        const reps = Number(log.reps) || 0;
        const volume = weight * reps;
        totals[group] += volume;
      }
    });

    const totalVolume = Object.values(totals).reduce((sum, v) => sum + v, 0);

    // Sort muscle groups by volume (highest to lowest)
    const sortedGroups = Object.entries(totals)
      .map(([name, volume]) => ({ name, volume }))
      .sort((a, b) => b.volume - a.volume);

    // Debug: Log the sorted order
    console.log('[VolumeSlide] Sorted by volume (highest to lowest):');
    sortedGroups.forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.name}: ${formatVolume(g.volume)} (${g.volume.toLocaleString()} kg)`);
    });

    return {
      totalVolume,
      sortedGroups,
    };
  }, [data]);

  return (
    <section className="section-slide bg-gradient-slide-7 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <p className="font-mono text-sm text-muted-foreground tracking-[0.3em] uppercase mb-4">
          TOTAL VOLUME LIFTED
        </p>
        
        <div id="volume-stat" className="gsap-volume">
          <h2 className="text-display text-massive text-center">
            <span className="text-primary neon-text">{formatVolume(volumeData.totalVolume)}</span>
          </h2>
          <p className="text-display text-huge text-center text-foreground -mt-4">
            KG
          </p>
        </div>
        
        {/* Treemap Container - Sorted by volume (highest to lowest) */}
        <div id="treemap-container" className="gsap-treemap w-full max-w-md mt-8">
          <div className="grid grid-cols-3 gap-2">
            {/* Rank 1: Largest box (col-span-2, row-span-2) */}
            {volumeData.sortedGroups[0] && (
              <div className="col-span-2 row-span-2 bg-primary/80 rounded-lg p-4 flex flex-col justify-end min-h-32">
                <p className="font-mono text-xs text-primary-foreground/70">{formatVolume(volumeData.sortedGroups[0].volume)} KG</p>
                <p className="font-display font-bold text-lg text-primary-foreground">{volumeData.sortedGroups[0].name}</p>
              </div>
            )}

            {/* Rank 2 & 3: Medium boxes (stacked on the right) */}
            {volumeData.sortedGroups[1] && (
              <div className="bg-primary/60 rounded-lg p-3 flex flex-col justify-end min-h-16">
                <p className="font-mono text-[10px] text-foreground/70">{formatVolume(volumeData.sortedGroups[1].volume)}</p>
                <p className="font-display font-bold text-sm text-foreground">{volumeData.sortedGroups[1].name}</p>
              </div>
            )}
            {volumeData.sortedGroups[2] && (
              <div className="bg-primary/50 rounded-lg p-3 flex flex-col justify-end min-h-16">
                <p className="font-mono text-[10px] text-foreground/70">{formatVolume(volumeData.sortedGroups[2].volume)}</p>
                <p className="font-display font-bold text-sm text-foreground">{volumeData.sortedGroups[2].name}</p>
              </div>
            )}
            
            {/* Rank 4: Wide box (col-span-2) */}
            {volumeData.sortedGroups[3] && (
              <div className="col-span-2 bg-primary/40 rounded-lg p-3 flex flex-col justify-end">
                <p className="font-mono text-xs text-foreground/70">{formatVolume(volumeData.sortedGroups[3].volume)} KG</p>
                <p className="font-display font-bold text-lg text-foreground">{volumeData.sortedGroups[3].name}</p>
              </div>
            )}

            {/* Rank 5: Smallest box */}
            {volumeData.sortedGroups[4] && (
              <div className="bg-secondary rounded-lg p-3 flex flex-col justify-end">
                <p className="font-mono text-[10px] text-muted-foreground">{formatVolume(volumeData.sortedGroups[4].volume)}</p>
                <p className="font-display font-bold text-sm text-foreground">{volumeData.sortedGroups[4].name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolumeSlide;
