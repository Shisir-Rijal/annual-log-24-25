import { useState, useEffect, useRef } from 'react';
import ProgressBar from '@/components/ProgressBar';
import AudioWidget from '@/components/AudioWidget';
import IntroSlide from '@/components/slides/IntroSlide';
import ScaleSlide from '@/components/slides/ScaleSlide';
import FrequencySlide from '@/components/slides/FrequencySlide';
import GrindSlide from '@/components/slides/GrindSlide';
import HeatmapSlide from '@/components/slides/HeatmapSlide';
import PeakMonthSlide from '@/components/slides/PeakMonthSlide';
import RankingSlide from '@/components/slides/RankingSlide';
import TopExercisesSlide from '@/components/slides/TopExercisesSlide';
import VolumeSlide from '@/components/slides/VolumeSlide';
import BodySlide from '@/components/slides/BodySlide';
import SoundtrackSlide from '@/components/slides/SoundtrackSlide';
import ArchetypeSlide from '@/components/slides/ArchetypeSlide';
import OutroSlide from '@/components/slides/OutroSlide';
import OutroSlide_2 from '@/components/slides/OutroSlide_2';

const TOTAL_SECTIONS = 14;

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
        <HeatmapSlide />
        <PeakMonthSlide />
        <RankingSlide />
        <TopExercisesSlide />
        <VolumeSlide />
        <BodySlide />
        <SoundtrackSlide />
        <ArchetypeSlide />
        <OutroSlide />
        <OutroSlide_2 />
      </div>
    </div>
  );
};

export default Index;
