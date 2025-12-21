// Generate mock heatmap data for 12 months
const generateHeatmapData = () => {
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return months.map(() => 
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 5))
  );
};

const ConsistencySlide = () => {
  const heatmapData = generateHeatmapData();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const getIntensityClass = (value: number) => {
    const intensities = [
      'bg-secondary/30',
      'bg-primary/20',
      'bg-primary/40',
      'bg-primary/60',
      'bg-primary/80',
    ];
    return intensities[value] || intensities[0];
  };

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
          CONSISTENCY OVER 12 MONTHS
        </p>
        
        {/* Audio Wave Heatmap */}
        <div id="heatmap-container" className="gsap-heatmap w-full max-w-3xl px-4">
          <div className="flex items-end justify-center gap-1 md:gap-2 h-40">
            {heatmapData.map((month, monthIndex) => (
              <div key={monthIndex} className="flex flex-col gap-1 items-center">
                {/* Bars for each week */}
                <div className="flex flex-col-reverse gap-0.5">
                  {month.map((value, weekIndex) => (
                    <div
                      key={weekIndex}
                      className={`w-4 md:w-6 h-4 md:h-6 rounded-sm transition-all duration-300 ${getIntensityClass(value)}`}
                      style={{
                        transform: `scaleY(${0.5 + value * 0.2})`,
                      }}
                    />
                  ))}
                </div>
                {/* Month Label */}
                <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground mt-2">
                  {months[monthIndex].slice(0, 1)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="font-mono text-xs text-muted-foreground">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-4 h-4 rounded-sm ${getIntensityClass(i)}`} />
              ))}
            </div>
            <span className="font-mono text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsistencySlide;
