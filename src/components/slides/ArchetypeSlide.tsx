const ArchetypeSlide = () => {
  return (
    <section className="section-slide bg-gradient-slide-10 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Pre-title */}
        <p className="font-mono text-sm text-muted-foreground tracking-[0.3em] uppercase mb-8">
          YOUR ARCHETYPE IS
        </p>
        
        {/* 3D Flip Card */}
        <div id="archetype-card" className="flip-card w-72 h-96 gsap-flip">
          <div className="flip-card-inner">
            {/* Front */}
            <div className="flip-card-front glass flex flex-col items-center justify-center p-8">
              <div className="text-6xl mb-4">🔥</div>
              <h2 className="text-display text-2xl text-center text-foreground mb-2">
                THE IRON
              </h2>
              <h2 className="text-display text-3xl text-center text-primary neon-text">
                ADDICT
              </h2>
              <p className="font-mono text-xs text-muted-foreground mt-6 text-center">
                HOVER TO REVEAL
              </p>
            </div>
            
            {/* Back */}
            <div className="flip-card-back glass bg-primary/10 flex flex-col items-center justify-center p-8">
              <p className="font-mono text-xs text-primary mb-4">DEFINITION</p>
              <p className="font-mono text-sm text-foreground text-center leading-relaxed">
                You don't just lift weights—you live for them. The gym is your temple, 
                the barbell your meditation. Rest days feel wrong.
              </p>
              <div className="mt-6 pt-6 border-t border-border w-full">
                <p className="font-mono text-xs text-muted-foreground text-center">
                  TRAITS
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <span className="px-2 py-1 bg-primary/20 rounded-full font-mono text-xs text-primary">
                    DEDICATED
                  </span>
                  <span className="px-2 py-1 bg-primary/20 rounded-full font-mono text-xs text-primary">
                    RELENTLESS
                  </span>
                  <span className="px-2 py-1 bg-primary/20 rounded-full font-mono text-xs text-primary">
                    FOCUSED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4">
            SEASON OF GRIND 2024
          </p>
          <button className="px-8 py-3 bg-primary text-primary-foreground font-display font-bold rounded-full neon-glow transition-transform hover:scale-105">
            SHARE YOUR WRAPPED
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArchetypeSlide;
