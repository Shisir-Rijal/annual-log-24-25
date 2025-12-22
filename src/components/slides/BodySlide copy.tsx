const BodySlide = () => {
  return (
    <section className="section-slide bg-gradient-slide-9 noise">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <h2 className="text-display text-large text-center mb-2">
          <span className="text-foreground">THE</span>
          <span className="text-primary neon-text"> BODY</span>
        </h2>
        
        <p className="font-mono text-sm text-muted-foreground mb-8">
          MUSCLES WORKED THIS YEAR
        </p>
        
        {/* SVG Body Container - Placeholder for interactive body map */}
        <div id="body-svg-container" className="svg-body-container gsap-body">
          {/* Simplified body silhouette placeholder */}
          <svg 
            viewBox="0 0 200 400" 
            className="w-full h-full"
            fill="none"
          >
            {/* Head */}
            <circle cx="100" cy="40" r="30" className="fill-secondary stroke-border stroke-2" />
            
            {/* Neck */}
            <rect x="90" y="70" width="20" height="20" className="fill-secondary" />
            
            {/* Shoulders */}
            <ellipse cx="100" cy="100" rx="60" ry="20" className="fill-primary/60" />
            
            {/* Torso - Chest (highlighted) */}
            <path 
              d="M50 100 L50 180 Q50 200 70 200 L130 200 Q150 200 150 180 L150 100 Z" 
              className="fill-primary/80 stroke-primary stroke-2"
            />
            
            {/* Arms */}
            <path d="M50 100 L20 180 L30 185 L55 115" className="fill-primary/40 stroke-border" />
            <path d="M150 100 L180 180 L170 185 L145 115" className="fill-primary/40 stroke-border" />
            
            {/* Core */}
            <rect x="70" y="200" width="60" height="40" className="fill-primary/30" />
            
            {/* Legs */}
            <path d="M70 240 L60 350 L80 350 L90 260 L100 260 L110 260 L120 350 L140 350 L130 240 Z" className="fill-primary/50 stroke-border" />
          </svg>
          
          {/* Muscle Labels */}
          <div className="absolute top-1/4 left-0 transform -translate-x-full pr-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary neon-glow" />
              <span className="font-mono text-xs text-muted-foreground">CHEST: 35%</span>
            </div>
          </div>
          
          <div className="absolute top-1/3 right-0 transform translate-x-full pl-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">BACK: 28%</span>
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
          </div>
          
          <div className="absolute bottom-1/4 left-0 transform -translate-x-full pr-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span className="font-mono text-xs text-muted-foreground">LEGS: 20%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BodySlide;
