const FrequencySlide = () => {
  return (
    <section className="section-slide bg-gradient-slide-2 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Label */}
        <p className="font-mono text-sm text-muted-foreground tracking-[0.3em] uppercase mb-6">
          TOTAL SESSIONS
        </p>
        
        {/* Counter */}
        <div id="session-counter" className="gsap-counter">
          <span className="text-display text-massive text-primary neon-text">
            118
          </span>
        </div>
        
        {/* Unit */}
        <p className="font-mono text-xl md:text-2xl text-foreground mt-4 tracking-wider">
          SESSIONS
        </p>
        
        {/* Stats Row */}
        <div className="flex gap-8 md:gap-16 mt-12">
          <div className="text-center">
            <p className="text-stat text-large text-foreground">2.3</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">PER WEEK</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-stat text-large text-foreground">72</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">AVG MINS</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-stat text-large text-foreground">142</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">TOTAL HRS</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrequencySlide;
