interface ProgressBarProps {
  totalSections: number;
  currentSection: number;
}

interface Checkpoint {
  label: string;
  slideIndex: number; // 0-based slide index
}

const ACTS: Checkpoint[] = [
  { label: 'I', slideIndex: 0 },    // Intro - System Boot / Atmospheric Build-up
  { label: 'II', slideIndex: 1 },   // Scale - First Beat Drop / The Stats
  { label: 'III', slideIndex: 6 },  // Top Exercises - Second Beat Drop / The Combat Loadout
  { label: 'IV', slideIndex: 9 },   // Soundtrack/Identity - Third Beat Drop / The Vibe
  { label: 'V', slideIndex: 13 },   // OutroSlide_2 - System Shutdown (100%)
];

const ProgressBar = ({ totalSections, currentSection }: ProgressBarProps) => {
  // Calculate progress as 0 to 1
  const progress = currentSection / (totalSections - 1);
  const progressPercent = progress * 100;

  // Calculate position for a checkpoint based on slide index
  const getCheckpointPosition = (slideIndex: number) => {
    return slideIndex / (totalSections - 1);
  };

  const isCheckpointActive = (checkpointPos: number) => {
    return progress >= checkpointPos;
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
      {/* Track */}
      <div className="relative h-[2px] bg-white/10 rounded-full">
        {/* Fill Bar */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#CCFF00] via-[#CCFF00] to-[#88aa00] rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            boxShadow: progressPercent > 0 ? `0 0 10px rgba(204, 255, 0, 0.6), 0 0 20px rgba(204, 255, 0, 0.3)` : 'none',
          }}
        />

        {/* Checkpoints (Diamonds) */}
        {ACTS.map((act, idx) => {
          const checkpointPos = getCheckpointPosition(act.slideIndex);
          const isActive = isCheckpointActive(checkpointPos);
          const isLast = idx === ACTS.length - 1;
          const leftPercent = checkpointPos * 100;

          return (
            <div
              key={idx}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isLast ? 'right-0' : ''
              }`}
              style={
                isLast
                  ? { transform: 'translate(50%, -50%)' }
                  : { left: `${leftPercent}%`, transform: 'translate(-50%, -50%)' }
              }
            >
              {/* Diamond */}
              <div
                className={`w-3 h-3 rotate-45 transition-all duration-300 ${
                  isActive
                    ? 'bg-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.8)]'
                    : 'bg-background border border-white/20'
                }`}
              />

              {/* Label */}
              <div
                className={`absolute top-4 left-1/2 -translate-x-1/2 font-mono text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isActive ? 'text-[#CCFF00]' : 'text-gray-500'
                }`}
              >
                {act.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
