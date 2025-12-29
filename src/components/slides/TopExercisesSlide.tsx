import { useMemo, useRef, useLayoutEffect, useState } from 'react';
import { useWorkoutData } from '../../context/DataProvider';
import { gsap } from 'gsap';
import { Link, Droplet, Shield } from 'lucide-react';

const TopExercisesSlide = () => {
  const { data } = useWorkoutData();
  const containerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

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

      // Gear slots fade in
      gsap.fromTo('.gear-slot', 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 1.2,
        }
      );
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

      {/* Main Content Container */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 py-8">
        {/* Main Grid - Takes 75-80% of vertical space */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="grid grid-cols-12 gap-8 w-full max-w-7xl">
          {/* LEFT SIDE - Signature Move Feature Card (60%) */}
          <div 
            ref={signatureRef}
            className="col-span-12 md:col-span-7 relative"
          >
            {/* Feature Card */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-8 md:p-12 relative overflow-hidden">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              
              {/* Giant "01" background texture */}
              <div className="absolute top-8 right-8 font-mono text-[200px] md:text-[280px] font-black text-white/5 select-none pointer-events-none">
                01
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Label */}
                <p className="font-mono text-xs text-[#CCFF00] tracking-[0.4em] uppercase mb-6">
                  SIGNATURE MOVE
                </p>

                {/* Exercise Name - HUGE */}
                <h2 className="text-display text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none uppercase tracking-tighter mb-12">
                  {arsenal.signature.name}
                </h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                  {/* Total Sets */}
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      TOTAL SETS
                    </p>
                    <p className="text-xl font-display font-bold text-primary">
                      {arsenal.signature.totalSets}
                    </p>
                  </div>

                  {/* Max Weight */}
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      MAX WEIGHT
                    </p>
                    <p className="text-xl font-display font-bold text-primary">
                      {arsenal.signature.maxWeight}
                      <span className="text-sm text-muted-foreground ml-1">kg</span>
                    </p>
                  </div>

                  {/* Mastery Level */}
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      MASTERY LVL
                    </p>
                    <p className="text-xl font-display font-bold text-primary neon-text">
                      {arsenal.signature.masteryLevel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-[#CCFF00]/20" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-[#CCFF00]/20" />
            </div>
          </div>

          {/* RIGHT SIDE - Support Arsenal List (40%) */}
          <div 
            ref={listRef}
            className="col-span-12 md:col-span-5 flex flex-col gap-6"
          >
            {/* List Container */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex-grow flex flex-col min-h-0">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex-shrink-0">
                <h3 className="text-display text-2xl font-bold text-white mb-1">
                  THE ARSENAL
                </h3>
                <p className="font-mono text-xs text-muted-foreground tracking-widest">
                  SUPPORT LOADOUT
                </p>
              </div>

              {/* List Items - Scrollable */}
              <div className="divide-y divide-white/5 overflow-y-auto flex-1">
                {arsenal.support.map((exercise, index) => {
                  const barWidth = (exercise.count / arsenal.maxCount) * 100;
                  const rank = String(index + 2).padStart(2, '0');
                  const isExpanded = expandedExercise === exercise.name;

                  const handleToggle = () => {
                    if (isExpanded) {
                      setExpandedExercise(null);
                    } else {
                      setExpandedExercise(exercise.name);
                    }
                  };

                  return (
                    <div 
                      key={exercise.name}
                      className="arsenal-item group"
                    >
                      {/* Header Row - Always Visible */}
                      <div 
                        className="px-6 py-5 hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                        onClick={handleToggle}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <span className={`font-mono text-xl font-bold transition-colors w-8 flex-shrink-0 ${
                            isExpanded ? 'text-[#CCFF00]' : 'text-gray-500 group-hover:text-[#CCFF00]'
                          }`}>
                            {rank}
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Name */}
                            <p className={`font-display text-base font-bold truncate transition-colors mb-2 ${
                              isExpanded ? 'text-[#CCFF00]' : 'text-white group-hover:text-[#CCFF00]'
                            }`}>
                              {exercise.name}
                            </p>

                            {/* Frequency Bar */}
                            <div className="h-0.5 bg-gray-900 rounded-full overflow-hidden">
                              <div 
                                className="freq-bar-fill h-full bg-gradient-to-r from-[#CCFF00] to-[#88aa00] rounded-full"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details Section - Accordion */}
                      <div 
                        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 pb-5 pt-0 border-t border-white/5">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4 pt-4">
                            {/* Total Sets */}
                            <div className="space-y-1">
                              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                TOTAL SETS
                              </p>
                              <p className="text-base font-display font-bold text-primary">
                                {exercise.totalSets}
                              </p>
                            </div>

                            {/* Max Weight */}
                            <div className="space-y-1">
                              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                MAX WEIGHT
                              </p>
                              <p className="text-base font-display font-bold text-primary">
                                {exercise.maxWeight}
                                <span className="text-xs text-muted-foreground ml-1">kg</span>
                              </p>
                            </div>

                            {/* Mastery Level */}
                            <div className="space-y-1">
                              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                MASTERY LVL
                              </p>
                              <p className="text-base font-display font-bold text-primary neon-text">
                                {exercise.masteryLevel}
                              </p>
                            </div>
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
                      className="arsenal-item px-6 py-5 opacity-30"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xl font-bold text-gray-800 w-8 flex-shrink-0">
                          {String(arsenal.support.length + i + 2).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <p className="font-mono text-sm text-gray-700 mb-2">— UNLOCKED —</p>
                          <div className="h-0.5 bg-gray-900 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Gear Section */}
            <div className="flex-shrink-0">
              {/* Label */}
              <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-3">
                EQUIPPED GEAR
              </p>

              {/* Inventory Slots */}
              <div className="flex gap-4">
                {/* Slot 1: Lifting Straps */}
                <div className="gear-slot group relative bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-4 w-24 h-24 flex flex-col items-center justify-center transition-all duration-300 hover:border-[#CCFF00]/50 hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                  <Link className="w-8 h-8 text-gray-400 group-hover:text-[#CCFF00] transition-colors mb-2" />
                  <p className="font-mono text-[10px] text-gray-500 group-hover:text-[#CCFF00] transition-colors uppercase tracking-wider">
                    STRAPS
                  </p>
                </div>

                {/* Slot 2: Hydration */}
                <div className="gear-slot group relative bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-4 w-24 h-24 flex flex-col items-center justify-center transition-all duration-300 hover:border-[#CCFF00]/50 hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                  <Droplet className="w-8 h-8 text-gray-400 group-hover:text-[#CCFF00] transition-colors mb-2" />
                  <p className="font-mono text-[10px] text-gray-500 group-hover:text-[#CCFF00] transition-colors uppercase tracking-wider">
                    H2O
                  </p>
                </div>

                {/* Slot 3: Sweat Shield */}
                <div className="gear-slot group relative bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-4 w-24 h-24 flex flex-col items-center justify-center transition-all duration-300 hover:border-[#CCFF00]/50 hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                  <Shield className="w-8 h-8 text-gray-400 group-hover:text-[#CCFF00] transition-colors mb-2" />
                  <p className="font-mono text-[10px] text-gray-500 group-hover:text-[#CCFF00] transition-colors uppercase tracking-wider">
                    TOWEL
                  </p>
                </div>
              </div>
            </div>
          </div>
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
