const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const values = [28, 22, 18, 25, 20, 12, 8]; // Session counts per day

const GrindSlide = () => {
  const maxValue = Math.max(...values);

  return (
    <section className="section-slide bg-gradient-slide-3 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <h2 className="text-display text-huge text-center mb-2">
          <span className="text-primary neon-text">MONDAY</span>
          <br />
          <span className="text-foreground">MADNESS</span>
        </h2>
        
        <p className="font-mono text-sm text-muted-foreground mb-12">
          YOUR FAVORITE DAY TO LIFT
        </p>
        
        {/* Radial Chart Container */}
        <div id="chart-container" className="chart-container max-w-lg gsap-chart">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Center Circle */}
            <div className="absolute inset-1/4 rounded-full bg-secondary/50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-stat text-xl md:text-2xl text-primary">28</p>
                <p className="font-mono text-[10px] text-muted-foreground">MONDAY</p>
              </div>
            </div>
            
            {/* Day Segments */}
            {days.map((day, index) => {
              const angle = (index * 360) / 7 - 90;
              const radius = 45 + (values[index] / maxValue) * 35;
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
              
              return (
                <div
                  key={day}
                  className="absolute transition-all duration-300"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div 
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      index === 0 
                        ? 'bg-primary text-primary-foreground neon-glow' 
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrindSlide;
