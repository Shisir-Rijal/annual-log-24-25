import { useMemo, useRef, useLayoutEffect } from 'react';
import { useWorkoutData } from '../../context/DataProvider';
import { gsap } from 'gsap';

const TopExercisesSlide = () => {
  const { data } = useWorkoutData();
  const containerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Calculate top 5 exercises by frequency
  const arsenal = useMemo(() => {
    const logs = data?.rawLogs || [];
    if (logs.length === 0) return null;

    // Count frequency of each exercise
    const exerciseCounts = new Map<string, { count: number; maxWeight: number; totalSets: number }>();

    logs.forEach((log) => {
      const name = log.exerciseName;
      const weight = Number(log.weight) || 0;

      if (!exerciseCounts.has(name)) {
        exerciseCounts.set(name, { count: 0, maxWeight: 0, totalSets: 0 });
      }

      const entry = exerciseCounts.get(name)!;
      entry.count += 1;
      entry.totalSets += 1;
      entry.maxWeight = Math.max(entry.maxWeight, weight);
    });

    // Convert to array and sort by frequency
    const sorted = Array.from(exerciseCounts.entries())
      .map(([name, stats]) => ({
        name,
        ...stats,
        masteryLevel: Math.round(stats.totalSets * 1.5),
      }))
      .sort((a, b) => b.count - a.count);

    // Take top 5
    const top5 = sorted.slice(0, 5);

    if (top5.length === 0) return null;

    const signature = top5[0];
    const support = top5.slice(1);
    const maxCount = signature.count;

    return {
      signature,
      support,
      maxCount,
    };
  }, [data]);

  // GSAP Animations
  useLayoutEffect(() => {
    if (!containerRef.current || !arsenal) return;

    const ctx = gsap.context(() => {
      // Signature move slide in from left
      gsap.from(signatureRef.current, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
      });

      // List items stagger in
      gsap.from('.arsenal-item', {
        x: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.5,
      });

      // Frequency bars grow
      gsap.from('.freq-bar-fill', {
        scaleX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.8,
        transformOrigin: 'left center',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [arsenal]);

  if (!arsenal) {
    return (
      <section className="section-slide bg-gradient-slide-8 noise">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-gray-500">Loading arsenal...</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="section-slide bg-gradient-slide-8 noise">
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <div className="absolute top-8 left-8 z-10">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          WEAPONS_OF_CHOICE
        </p>
      </div>

      <div className="absolute inset-0 flex">
        {/* LEFT SIDE - Signature Move (60%) */}
        <div 
          ref={signatureRef}
          className="w-[55%] h-full flex flex-col justify-center px-12 relative"
        >
          {/* Background glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #CCFF00 0%, transparent 70%)' }}
          />

          {/* Label */}
          <p className="font-mono text-xs text-[#CCFF00] tracking-[0.4em] uppercase mb-4 relative z-10">
            SIGNATURE MOVE
          </p>

          {/* Exercise Name */}
          <h2 className="text-display text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight relative z-10 mb-8">
            {arsenal.signature.name}
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 relative z-10">
            {/* Total Sets */}
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                TOTAL SETS
              </p>
              <p className="font-display text-3xl font-bold text-white">
                {arsenal.signature.totalSets}
              </p>
            </div>

            {/* Max Weight */}
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                MAX WEIGHT
              </p>
              <p className="font-display text-3xl font-bold text-white">
                {arsenal.signature.maxWeight}
                <span className="text-lg text-gray-500 ml-1">kg</span>
              </p>
            </div>

            {/* Mastery Level */}
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                MASTERY LVL
              </p>
              <p className="font-display text-3xl font-bold text-[#CCFF00] neon-text">
                {arsenal.signature.masteryLevel}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 w-32 h-[1px] bg-gradient-to-r from-[#CCFF00] to-transparent relative z-10" />
        </div>

        {/* RIGHT SIDE - Support Arsenal (40%) */}
        <div 
          ref={listRef}
          className="w-[45%] h-full flex flex-col justify-center px-8 border-l border-white/5"
        >
          {/* Title */}
          <div className="mb-8">
            <h3 className="text-display text-2xl font-bold text-white mb-1">
              THE ARSENAL
            </h3>
            <p className="font-mono text-xs text-gray-500 tracking-widest">
              SUPPORT LOADOUT
            </p>
          </div>

          {/* List */}
          <div className="space-y-4">
            {arsenal.support.map((exercise, index) => {
              const barWidth = (exercise.count / arsenal.maxCount) * 100;
              const rank = String(index + 2).padStart(2, '0');

              return (
                <div 
                  key={exercise.name}
                  className="arsenal-item group"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <span className="font-mono text-2xl font-bold text-gray-700 group-hover:text-[#CCFF00] transition-colors w-10">
                      {rank}
                    </span>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Name */}
                      <p className="font-display text-lg text-white font-medium truncate group-hover:text-[#CCFF00] transition-colors">
                        {exercise.name}
                      </p>

                      {/* Frequency Bar */}
                      <div className="mt-2 h-1 bg-gray-900 rounded-full overflow-hidden">
                        <div 
                          className="freq-bar-fill h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      {/* Meta */}
                      <div className="mt-1 flex items-center gap-4">
                        <span className="font-mono text-[10px] text-gray-600">
                          {exercise.totalSets} SETS
                        </span>
                        <span className="font-mono text-[10px] text-gray-600">
                          {exercise.maxWeight} KG MAX
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty slots if less than 4 support exercises */}
            {arsenal.support.length < 4 && 
              Array.from({ length: 4 - arsenal.support.length }).map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="arsenal-item opacity-30"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-2xl font-bold text-gray-800 w-10">
                      {String(arsenal.support.length + i + 2).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <p className="font-mono text-sm text-gray-700">— UNLOCKED —</p>
                      <div className="mt-2 h-1 bg-gray-900 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase">
          FREQUENCY ANALYSIS // 2024
        </p>
      </div>
    </section>
  );
};

export default TopExercisesSlide;

