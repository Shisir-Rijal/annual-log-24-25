import { useState, useEffect, useRef } from 'react';
import ProgressBar from '@/components/ProgressBar';
import AudioWidget from '@/components/AudioWidget';
import IntroSlide from '@/components/slides/IntroSlide';
import ScaleSlide from '@/components/slides/ScaleSlide';
import FrequencySlide from '@/components/slides/FrequencySlide';
import GrindSlide from '@/components/slides/GrindSlide';
import ConsistencySlide from '@/components/slides/ConsistencySlide';
import PeakMonthSlide from '@/components/slides/PeakMonthSlide';
import RankingSlide from '@/components/slides/RankingSlide';
import VolumeSlide from '@/components/slides/VolumeSlide';
import MachineSlide from '@/components/slides/MachineSlide';
import BodySlide from '@/components/slides/BodySlide';
import ArchetypeSlide from '@/components/slides/ArchetypeSlide';

const TOTAL_SECTIONS = 11;

const Index = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const sectionHeight = window.innerHeight;
      const newSection = Math.round(scrollPosition / sectionHeight);
      setCurrentSection(Math.min(newSection, TOTAL_SECTIONS - 1));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Progress Bar */}
      <ProgressBar totalSections={TOTAL_SECTIONS} currentSection={currentSection} />
      
      {/* Audio Widget */}
      <AudioWidget />
      
      {/* Main Scroll Container */}
      <div 
        ref={containerRef}
        className="scroll-container"
      >
        <IntroSlide />
        <ScaleSlide />
        <FrequencySlide />
        <GrindSlide />
        <ConsistencySlide />
        <PeakMonthSlide />
        <RankingSlide />
        <VolumeSlide />
        <MachineSlide />
        <BodySlide />
        <ArchetypeSlide />
      </div>
    </div>
  );
};

export default Index;
