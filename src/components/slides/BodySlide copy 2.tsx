import { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import Model from 'react-body-highlighter';
import { RotateCcw } from 'lucide-react';

// 1. MUSCLE LISTS (Must match library render order exactly)
const ANTERIOR_MUSCLES = [
  'chest', 'abs', 'obliques', 'biceps', 'triceps', 'front-deltoids',
  'quadriceps', 'calves', 'forearm', 'trapezius', 'head', 'knees', 'abductors'
];

const POSTERIOR_MUSCLES = [
  'trapezius', 'upper-back', 'lower-back', 'back-deltoids', 'triceps',
  'gluteal', 'hamstring', 'calves', 'head', 'knees', 'adductor'
];

// 2. LOGICAL GROUPING FOR CLICKS
const MUSCLE_GROUPS: Record<string, string> = {
  'trapezius': 'BACK',
  'upper-back': 'BACK',
  'lower-back': 'BACK',
  'back-deltoids': 'BACK',
  'chest': 'CHEST',
  'biceps': 'ARMS',
  'triceps': 'ARMS',
  'forearm': 'ARMS',
  'front-deltoids': 'SHOULDERS',
  'quadriceps': 'LEGS',
  'hamstring': 'LEGS',
  'calves': 'LEGS',
  'gluteal': 'LEGS',
  'adductor': 'LEGS',
  'abductors': 'LEGS',
  'knees': 'LEGS',
  'abs': 'CORE',
  'obliques': 'CORE',
  'head': 'HEAD',
  'neck': 'HEAD'
};

const BodySlide = () => {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleView = useCallback(() => {
    setHoveredMuscle(null);
    setView(prev => prev === 'anterior' ? 'posterior' : 'anterior');
  }, []);

  const handleClick = useCallback(({ muscle }: { muscle: string }) => {
    const group = MUSCLE_GROUPS[muscle] || muscle.toUpperCase();
    console.log(`Clicked: ${muscle} -> Group: ${group}`);
  }, []);

  // 3. DOM HYDRATION EFFECT (The Magic Fix)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Tiny timeout to ensure SVG is rendered
    const timer = setTimeout(() => {
      const polygons = container.querySelectorAll('svg polygon, svg path');
      const muscleList = view === 'anterior' ? ANTERIOR_MUSCLES : POSTERIOR_MUSCLES;
      
      polygons.forEach((poly, index) => {
        if (index >= muscleList.length) return;

        const muscleName = muscleList[index];
        const el = poly as HTMLElement;

        // Attach Listener
        el.onmouseenter = () => setHoveredMuscle(muscleName);
        el.onmouseleave = () => setHoveredMuscle(null);
        el.style.cursor = 'pointer';
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [view]);

  // 4. DATA PROP DRIVES THE HIGHLIGHT
  const activeData = hoveredMuscle
    ? [{ name: 'Active', muscles: [hoveredMuscle] }]
    : [];

  return (
    <section className="section-slide bg-gradient-slide-9 noise">
      {/* Base Style: Dark body */}
      <style>{`
        .body-model-container svg polygon,
        .body-model-container svg path {
          fill: #2C2C2C !important;
          transition: fill 0.15s ease, filter 0.15s ease;
        }
      `}</style>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8 z-10">
          <h2 className="text-6xl md:text-8xl font-display font-black text-white uppercase tracking-tighter mb-2">
            THE <span className="text-[#CCFF00]">BODY</span>
          </h2>
          <p className="font-mono text-gray-400 tracking-widest uppercase text-sm">
            {hoveredMuscle ? hoveredMuscle.toUpperCase().replace(/-/g, ' ') : 'SELECT A MUSCLE'}
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-12 z-10">
          <div
            ref={containerRef}
            className="relative bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl body-model-container"
          >
            <Model
              type={view}
              data={activeData}
              highlightedColors={['#CCFF00', '#CCFF00']} // Neon Green
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
        </div>
      </div>
    </section>
  );
};

export default BodySlide;
