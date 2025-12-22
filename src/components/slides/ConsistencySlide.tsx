import { useMemo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useWorkoutData } from '@/context/DataProvider';
import { getActivityHeatmap, ActivityHeatmapPoint } from '@/utils/dataProcessor';

interface HeatmapDay {
  date: string; // YYYY-MM-DD format
  count: number;
  intensity: number;
}

const ConsistencySlide = () => {
  const { data, isLoading } = useWorkoutData();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get activity heatmap data
  const { heatmapData } = useMemo(() => {
    if (!data || !data.rawLogs || !Array.isArray(data.rawLogs)) {
      return { heatmapData: [] };
    }
    return getActivityHeatmap(data.rawLogs);
  }, [data]);

  // Generate last 160 days (approx 5-6 months) and fill with data
  const { heatmapDays, monthLabels } = useMemo(() => {
    const days: HeatmapDay[] = [];
    const monthPositions: { month: string; columnIndex: number }[] = [];
    const today = new Date();
    
    // Create a map of existing data by date string
    const dataMap = new Map<string, HeatmapDay>();
    if (heatmapData && Array.isArray(heatmapData)) {
      heatmapData.forEach((point) => {
        const dateStr = typeof point.date === 'string' 
          ? point.date.split('T')[0].split(' ')[0]
          : new Date(point.date).toISOString().split('T')[0];
        dataMap.set(dateStr, {
          date: dateStr,
          count: Number(point.count) || 0,
          intensity: Number(point.intensity) || 0,
        });
      });
    }

    let lastMonth = -1;
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    // Generate last 160 days
    for (let i = 159; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const currentMonth = date.getMonth();
      
      // Track month changes (every 7 days = 1 week = 1 column in grid)
      const columnIndex = Math.floor((159 - i) / 7);
      
      // If month changed, mark the position
      if (currentMonth !== lastMonth) {
        monthPositions.push({
          month: monthNames[currentMonth],
          columnIndex: columnIndex,
        });
        lastMonth = currentMonth;
      }
      
      // Use existing data or create empty day
      const existingData = dataMap.get(dateStr);
      days.push(
        existingData || {
          date: dateStr,
          count: 0,
          intensity: 0,
        }
      );
    }

    return { heatmapDays: days, monthLabels: monthPositions };
  }, [heatmapData]);

  // GSAP Animation on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const cells = containerRef.current.querySelectorAll('.heatmap-cell');
    if (cells.length === 0) return;

    // Animate cells with stagger effect
    gsap.from(cells, {
      scale: 0,
      opacity: 0,
      stagger: {
        amount: 1.5,
        from: 'random',
      },
      ease: 'elastic.out(1, 0.3)',
      duration: 0.8,
    });
  }, [heatmapDays]);

  // Color logic based on raw count (not intensity)
  const getCellClass = (count: number): string => {
    if (count === 0) {
      // Rest Day: Dark/subtle
      return 'bg-white/5';
    }
    
    if (count >= 1 && count <= 3) {
      // Standard Training: Clearly visible Neon Green with subtle glow
      return 'bg-[#CCFF00] shadow-[0_0_5px_rgba(204,255,0,0.4)]';
    }
    
    // Hard Training (count > 3): Super glowing with high intensity
    return 'bg-[#CCFF00] shadow-[0_0_15px_#CCFF00] z-10 relative';
  };

  // Get tooltip text (always returns string)
  const getTooltip = (day: HeatmapDay): string => {
    if (day.count === 0) {
      return `${day.date}: Rest Day`;
    }
    return `${day.date}: ${day.count} Sets`;
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="section-slide bg-gradient-slide-4 noise">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-sm text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-slide bg-gradient-slide-4 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <h2 className="text-display text-huge text-center mb-2">
          <span className="text-foreground">YOUR</span>
          <br />
          <span className="text-primary neon-text">RHYTHM</span>
        </h2>
        
        <p className="font-mono text-sm text-muted-foreground mb-10">
          CONSISTENCY OVER 5 MONTHS
        </p>
        
        {/* Custom CSS Grid Heatmap */}
        <div className="w-full max-w-5xl px-4">
          <div 
            ref={containerRef}
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 1fr)',
              gridAutoFlow: 'column',
              gap: '2px',
              justifyContent: 'center',
            }}
          >
            {heatmapDays.map((day, index) => (
              <div
                key={`${day.date}-${index}`}
                className={`heatmap-cell w-3 h-3 rounded-[2px] ${getCellClass(day.count)}`}
                title={getTooltip(day)}
                style={{
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>
          
          {/* Month Labels */}
          <div className="flex justify-center mt-2 relative" style={{ width: '100%' }}>
            {monthLabels.map((label, index) => {
              // Calculate position: each column is approximately the width of 7 cells + gap
              // With 160 days / 7 = ~23 columns
              const totalColumns = Math.ceil(160 / 7);
              const cellWidth = 12; // w-3 = 12px
              const gap = 2;
              const columnWidth = (cellWidth + gap) * 7;
              const position = (label.columnIndex / totalColumns) * 100;
              
              return (
                <div
                  key={`${label.month}-${index}`}
                  className="font-mono text-[10px] text-muted-foreground absolute"
                  style={{
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {label.month}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mt-8">
          {/* Left: REST */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-white/5" />
            <span className="font-mono text-xs text-gray-500">REST</span>
          </div>
          
          {/* Right: TRAINING */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]" />
            <span className="font-mono text-xs text-[#CCFF00]">TRAINING</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsistencySlide;
