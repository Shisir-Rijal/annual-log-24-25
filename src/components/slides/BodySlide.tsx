import { useState, useCallback } from 'react';
// @ts-ignore
import Model from 'react-body-highlighter';
import { RotateCcw } from 'lucide-react';

const BodySlide = () => {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');

  const toggleView = useCallback(() => {
    setView(prev => prev === 'anterior' ? 'posterior' : 'anterior');
  }, []);

  const handleClick = useCallback(({ muscle }: { muscle: string }) => {
    console.log('Clicked muscle:', muscle);
    // TODO: Open Chart Logic here
  }, []);

  return (
    <section className="section-slide bg-gradient-slide-9 noise">
      {/* 1. INJECTED STYLES FOR HOVER EFFECT */}
      <style>{`
        /* Default State: Dark polygons */
        .body-model-container svg polygon {
          fill: #2C2C2C;
          fill-opacity: 0.85;
          transition: fill 150ms ease, fill-opacity 150ms ease, filter 150ms ease;
          cursor: pointer;
        }
        
        /* Hover State: Neon Green & Glow */
        .body-model-container svg polygon:hover {
          fill: #CCFF00 !important;
          fill-opacity: 1 !important;
          stroke: #FFFFFF;
          stroke-width: 1px;
          filter: drop-shadow(0 0 8px rgba(204, 255, 0, 0.6));
        }
      `}</style>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* HEADER */}
        <div className="text-center mb-8 z-10">
          <h2 className="text-6xl md:text-8xl font-display font-black text-white uppercase tracking-tighter mb-2">
            THE <span className="text-[#CCFF00]">BODY</span>
          </h2>
          <p className="font-mono text-gray-400 tracking-widest uppercase text-sm">
            Muscles worked this year
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-12 z-10">
          {/* 2. THE MODEL WRAPPER */}
          <div className="relative bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl body-model-container">
            <Model
              type={view}
              data={[]} // Empty data = Dark body base
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

          {/* 3. INFO PANEL */}
          <div className="flex flex-col gap-4 min-w-[180px]">
            <p className="font-mono text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">
              {view.toUpperCase()} VIEW
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-sm bg-[#CCFF00] opacity-25" />
              <span className="font-mono text-sm text-white/50">
                HOVER A MUSCLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BodySlide;
