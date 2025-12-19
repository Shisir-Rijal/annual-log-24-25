const MachineSlide = () => {
  return (
    <section className="section-slide bg-gradient-slide-8 noise">
      <div className="absolute inset-0 flex flex-col md:flex-row">
        {/* Left Side - Free Weights */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border">
          <p className="font-mono text-xs text-muted-foreground tracking-[0.2em] uppercase mb-2">
            FREE WEIGHTS
          </p>
          <h3 id="free-weights-stat" className="gsap-split-left text-display text-huge text-primary neon-text">
            68%
          </h3>
          <p className="font-mono text-sm text-muted-foreground mt-4">
            80 SESSIONS
          </p>
          
          {/* Icon placeholder */}
          <div className="mt-8 w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-primary">🏋️</span>
          </div>
        </div>
        
        {/* Right Side - Machines */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-secondary/20">
          <p className="font-mono text-xs text-muted-foreground tracking-[0.2em] uppercase mb-2">
            MACHINES
          </p>
          <h3 id="machines-stat" className="gsap-split-right text-display text-huge text-foreground">
            32%
          </h3>
          <p className="font-mono text-sm text-muted-foreground mt-4">
            38 SESSIONS
          </p>
          
          {/* Icon placeholder */}
          <div className="mt-8 w-20 h-20 rounded-full border-2 border-muted flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-muted-foreground">⚙️</span>
          </div>
        </div>
      </div>
      
      {/* Center Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-display text-large text-foreground">
          MAN <span className="text-muted-foreground">vs</span> MACHINE
        </h2>
      </div>
    </section>
  );
};

export default MachineSlide;
