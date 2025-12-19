const IntroSlide = () => {
  return (
    <section className="section-slide bg-gradient-slide-1 noise grid-pattern">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Pre-title */}
        <p className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.3em] uppercase mb-4 gsap-pretitle">
          YOUR 2024
        </p>
        
        {/* Main Title */}
        <h1 
          id="hero-title"
          className="gsap-hero-text text-display text-massive text-center text-foreground"
        >
          SEASON
          <br />
          <span className="text-primary neon-text">OF GRIND</span>
        </h1>
        
        {/* Subtitle */}
        <p className="font-mono text-sm md:text-lg text-muted-foreground mt-8 tracking-wider gsap-subtitle">
          365 DAYS • EVERY REP COUNTED
        </p>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default IntroSlide;
