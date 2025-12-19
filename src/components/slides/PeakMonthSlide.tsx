const PeakMonthSlide = () => {
  // Generate calendar grid for November
  const daysInMonth = 30;
  const startDay = 4; // November 2024 starts on Friday (4)
  const activeDays = [1, 4, 5, 7, 8, 11, 12, 14, 15, 18, 19, 21, 22, 25, 26, 28, 29]; // Active workout days

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  return (
    <section className="section-slide bg-gradient-slide-5 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <h2 className="text-display text-huge text-center mb-2">
          <span className="text-primary neon-text">NOVEMBER</span>
          <br />
          <span className="text-foreground">REIGN</span>
        </h2>
        
        <p className="font-mono text-sm text-muted-foreground mb-8">
          YOUR PEAK PERFORMANCE MONTH
        </p>
        
        {/* Calendar Grid */}
        <div id="calendar-container" className="gsap-calendar w-full max-w-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center font-mono text-xs text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`aspect-square rounded-md flex items-center justify-center font-mono text-sm transition-all ${
                  day === null
                    ? 'bg-transparent'
                    : activeDays.includes(day)
                    ? 'bg-primary text-primary-foreground neon-glow'
                    : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <p className="text-stat text-2xl text-primary">17</p>
              <p className="font-mono text-xs text-muted-foreground">SESSIONS</p>
            </div>
            <div className="text-center">
              <p className="text-stat text-2xl text-foreground">57%</p>
              <p className="font-mono text-xs text-muted-foreground">ACTIVE DAYS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeakMonthSlide;
