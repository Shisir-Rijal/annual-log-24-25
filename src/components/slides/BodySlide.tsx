import { useState, useCallback, useMemo } from 'react';
// @ts-ignore
import Model from 'react-body-highlighter';
import { RotateCcw } from 'lucide-react';

// 1. LOGICAL GROUPING (Maps clicks to broader groups)
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

const BodySlide = () => {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const toggleView = useCallback(() => {
    setView(prev => prev === 'anterior' ? 'posterior' : 'anterior');
  }, []);

  const handleClick = useCallback(({ muscle }: { muscle: string }) => {
    const mapping = MUSCLE_GROUPS[muscle];
    if (mapping && mapping.group === selectedGroup) {
      setSelectedGroup(null);
    } else if (mapping) {
      setSelectedGroup(mapping.group);
    } else {
      setSelectedGroup(muscle);
    }
  }, [selectedGroup]);

  // 2. DATA PROP: Tells the library which muscles are active
  const modelData = useMemo(() => {
    if (!selectedGroup) return [];
    const groupDef = Object.values(MUSCLE_GROUPS).find(g => g.group === selectedGroup);
    return [{ name: selectedGroup, muscles: groupDef ? groupDef.muscles : [selectedGroup] }];
  }, [selectedGroup]);

  return (
    <section className="section-slide bg-gradient-slide-9 noise">
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
        /* We target both HEX and RGB because browsers differ in rendering */
        .body-model-container svg polygon[fill="#CCFF00"],
        .body-model-container svg path[fill="#CCFF00"],
        .body-model-container svg polygon[style*="rgb(204, 255, 0)"] {
          fill-opacity: 1 !important;
          stroke: #FFFFFF;
          stroke-width: 1.5px;
          filter: drop-shadow(0 0 15px rgba(204, 255, 0, 0.7)) drop-shadow(0 0 30px rgba(204, 255, 0, 0.4));
        }
      `}</style>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8 z-10">
          <h2 className="text-6xl md:text-8xl font-display font-black text-white uppercase tracking-tighter mb-2">
            THE <span className="text-[#CCFF00]">BODY</span>
          </h2>
          <p className="font-mono text-gray-400 tracking-widest uppercase text-sm">
            {selectedGroup ? `SELECTED: ${selectedGroup}` : 'SELECT A MUSCLE GROUP'}
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-12 z-10">
          <div className="relative bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl body-model-container">
            <Model
              type={view}
              data={modelData}
              highlightedColors={['#CCFF00', '#CCFF00']} // Sets the fill color we target in CSS
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

          <div className="flex flex-col gap-4 min-w-[180px]">
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
    </section>
  );
};

export default BodySlide;
