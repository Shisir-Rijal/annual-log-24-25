import { useState, useCallback, useMemo } from 'react';
// @ts-ignore
import Model from 'react-body-highlighter';
import { RotateCcw } from 'lucide-react';

// 1. LOGICAL GROUPING DEFINITION
// Maps specific click targets to broader groups
const MUSCLE_GROUPS: Record<string, { group: string; muscles: string[] }> = {
  // BACK
  'trapezius': { group: 'BACK', muscles: ['trapezius', 'upper-back', 'lower-back', 'back-deltoids'] },
  'upper-back': { group: 'BACK', muscles: ['trapezius', 'upper-back', 'lower-back', 'back-deltoids'] },
  'lower-back': { group: 'BACK', muscles: ['trapezius', 'upper-back', 'lower-back', 'back-deltoids'] },

  // CHEST
  'chest': { group: 'CHEST', muscles: ['chest'] },

  // ARMS
  'biceps': { group: 'ARMS', muscles: ['biceps', 'triceps', 'forearm'] },
  'triceps': { group: 'ARMS', muscles: ['biceps', 'triceps', 'forearm'] },
  'forearm': { group: 'ARMS', muscles: ['biceps', 'triceps', 'forearm'] },

  // SHOULDERS
  'front-deltoids': { group: 'SHOULDERS', muscles: ['front-deltoids', 'back-deltoids'] },
  'back-deltoids': { group: 'SHOULDERS', muscles: ['front-deltoids', 'back-deltoids'] },

  // LEGS
  'quadriceps': { group: 'LEGS', muscles: ['quadriceps', 'hamstring', 'calves', 'gluteal', 'adductor'] },
  'hamstring': { group: 'LEGS', muscles: ['quadriceps', 'hamstring', 'calves', 'gluteal'] },
  'calves': { group: 'LEGS', muscles: ['calves'] },
  'gluteal': { group: 'LEGS', muscles: ['gluteal'] },

  // ABS
  'abs': { group: 'CORE', muscles: ['abs', 'obliques'] },
  'obliques': { group: 'CORE', muscles: ['abs', 'obliques'] },
};

const BodySlide = () => {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const toggleView = useCallback(() => {
    setView(prev => prev === 'anterior' ? 'posterior' : 'anterior');
  }, []);

  // 2. HANDLE CLICK: LOCK THE GROUP
  const handleClick = useCallback(({ muscle }: { muscle: string }) => {
    const mapping = MUSCLE_GROUPS[muscle];

    // If we click the same group again, deselect it. Otherwise select new group.
    if (mapping && mapping.group === selectedGroup) {
      setSelectedGroup(null);
      console.log('Deselected');
    } else if (mapping) {
      setSelectedGroup(mapping.group);
      console.log(`Selected Group: ${mapping.group}`);
      // TODO: Open Chart for mapping.group
    } else {
      // Fallback for unmapped muscles
      setSelectedGroup(muscle);
      console.log(`Selected Muscle: ${muscle}`);
    }
  }, [selectedGroup]);

  // 3. COMPUTE DATA FOR LIBRARY
  // If a group is selected, we pass ALL its muscles to the library.
  // The library will then render them symmetrically in neon.
  const modelData = useMemo(() => {
    if (!selectedGroup) return [];

    // Find the definition for this group
    const groupDef = Object.values(MUSCLE_GROUPS).find(g => g.group === selectedGroup);
    if (groupDef) {
      return [{ name: selectedGroup, muscles: groupDef.muscles }];
    }

    // Fallback if it's a direct muscle name
    return [{ name: selectedGroup, muscles: [selectedGroup] }];
  }, [selectedGroup]);

  return (
    <section className="section-slide bg-gradient-slide-9 noise">
      {/* CSS for hover hint */}
      <style>{`
        /* Base: Dark */
        .body-model-container svg polygon {
          fill: #2C2C2C;
          fill-opacity: 0.85;
          transition: fill 150ms ease, fill-opacity 150ms ease;
          cursor: pointer;
        }
        
        /* Hover: Neon Hint (Individual) */
        .body-model-container svg polygon:hover {
          fill: #CCFF00 !important;
          fill-opacity: 0.6 !important; /* Slightly generic hover */
          stroke: #FFFFFF;
          stroke-width: 1px;
        }
        /* ACTIVE STATE (Handled by JS Data Prop): */
        /* No CSS needed for active state because we pass 'highlightedColors' prop */
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
              highlightedColors={['#CCFF00', '#CCFF00']} // Active selection = Full Neon
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

          {/* INFO PANEL */}
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
