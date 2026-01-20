const RankingSlide = () => {
  return (
    <section 
      tabIndex={0}
      aria-label="Ranking Slide - Top 4% of all lifters"
      className="section-slide bg-gradient-slide-6 noise focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Pre-title */}
        <p className="font-mono text-sm text-muted-foreground tracking-[0.3em] uppercase mb-4">
          YOU'RE IN THE
        </p>
        
        {/* Main Stat */}
        <div id="ranking-stat" className="gsap-ranking">
          <h2 className="text-display text-massive text-center">
            <span className="text-primary neon-text">TOP 4%</span>
          </h2>
        </div>
        
        <p className="font-mono text-lg text-foreground mt-4">
          OF ALL LIFTERS
        </p>
        
        {/* Pyramid Visual */}
        <div id="pyramid-container" className="gsap-pyramid mt-12 relative">
          {/* Pyramid Layers */}
          <div className="flex flex-col items-center gap-1">
            {/* Top - You */}
            <div className="w-12 h-8 bg-primary neon-glow flex items-center justify-center rounded-sm">
              <span className="font-mono text-[10px] text-primary-foreground font-bold">YOU</span>
            </div>
            
            {/* Layer 2 */}
            <div className="w-24 h-6 bg-primary/60 flex items-center justify-center rounded-sm">
              <span className="font-mono text-[10px] text-primary-foreground">TOP 10%</span>
            </div>
            
            {/* Layer 3 */}
            <div className="w-36 h-6 bg-primary/40 flex items-center justify-center rounded-sm">
              <span className="font-mono text-[10px] text-foreground">TOP 25%</span>
            </div>
            
            {/* Layer 4 */}
            <div className="w-48 h-6 bg-primary/20 flex items-center justify-center rounded-sm">
              <span className="font-mono text-[10px] text-foreground">TOP 50%</span>
            </div>
            
            {/* Base */}
            <div className="w-64 h-8 bg-secondary flex items-center justify-center rounded-sm">
              <span className="font-mono text-[10px] text-muted-foreground">ALL LIFTERS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RankingSlide;
