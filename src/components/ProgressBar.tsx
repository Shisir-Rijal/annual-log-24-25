import { useState, useEffect } from 'react';

interface ProgressBarProps {
  totalSections: number;
  currentSection: number;
}

const ProgressBar = ({ totalSections, currentSection }: ProgressBarProps) => {
  const progress = ((currentSection + 1) / totalSections) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-secondary">
      <div 
        className="progress-bar h-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
