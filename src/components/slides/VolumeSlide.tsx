const VolumeSlide = () => {
  // Treemap data representing different exercises/muscle groups
  const treemapData = [
    { name: 'CHEST', value: 35, size: 'large' },
    { name: 'BACK', value: 28, size: 'large' },
    { name: 'LEGS', value: 20, size: 'medium' },
    { name: 'SHOULDERS', value: 10, size: 'small' },
    { name: 'ARMS', value: 7, size: 'small' },
  ];

  return (
    <section className="section-slide bg-gradient-slide-7 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <p className="font-mono text-sm text-muted-foreground tracking-[0.3em] uppercase mb-4">
          TOTAL VOLUME LIFTED
        </p>
        
        <div id="volume-stat" className="gsap-volume">
          <h2 className="text-display text-massive text-center">
            <span className="text-primary neon-text">1.2M</span>
          </h2>
          <p className="text-display text-huge text-center text-foreground -mt-4">
            KG
          </p>
        </div>
        
        {/* Treemap Container */}
        <div id="treemap-container" className="gsap-treemap w-full max-w-md mt-8">
          <div className="grid grid-cols-3 gap-2">
            {/* Large boxes */}
            <div className="col-span-2 row-span-2 bg-primary/80 rounded-lg p-4 flex flex-col justify-end min-h-32">
              <p className="font-mono text-xs text-primary-foreground/70">420K KG</p>
              <p className="font-display font-bold text-lg text-primary-foreground">CHEST</p>
            </div>
            <div className="bg-primary/60 rounded-lg p-3 flex flex-col justify-end min-h-16">
              <p className="font-mono text-[10px] text-foreground/70">120K</p>
              <p className="font-display font-bold text-sm text-foreground">LEGS</p>
            </div>
            <div className="bg-primary/50 rounded-lg p-3 flex flex-col justify-end min-h-16">
              <p className="font-mono text-[10px] text-foreground/70">84K</p>
              <p className="font-display font-bold text-sm text-foreground">ARMS</p>
            </div>
            
            {/* Medium boxes */}
            <div className="col-span-2 bg-primary/40 rounded-lg p-3 flex flex-col justify-end">
              <p className="font-mono text-xs text-foreground/70">336K KG</p>
              <p className="font-display font-bold text-lg text-foreground">BACK</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 flex flex-col justify-end">
              <p className="font-mono text-[10px] text-muted-foreground">240K</p>
              <p className="font-display font-bold text-sm text-foreground">SHOULDERS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolumeSlide;
