import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWorkoutData } from '@/context/DataProvider';

gsap.registerPlugin(ScrollTrigger);

// Helper function to format date as "DD. MMM"
const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  return `${day}. ${month}`;
};

const ScaleSlide = () => {
  const { data } = useWorkoutData();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const node1Ref = useRef<HTMLButtonElement>(null);
  const node2Ref = useRef<HTMLButtonElement>(null);
  const node3Ref = useRef<HTMLButtonElement>(null);
  const line1Ref = useRef<SVGPathElement>(null);
  const line2Ref = useRef<SVGPathElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  
  const [displayedText, setDisplayedText] = useState('');
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Calculate mission timeline data
  const { firstDate, lastDate, uniqueExercises } = useMemo(() => {
    if (!data?.rawLogs || data.rawLogs.length === 0) {
      return { firstDate: '01. JAN', lastDate: '31. DEC', uniqueExercises: 0 };
    }
    const logs = data.rawLogs;
    const uniqueDates = [...new Set(logs.map(log => log.date?.split('T')[0]))].filter(Boolean).sort();
    const firstDateStr = uniqueDates[0] || '2024-01-01';
    const lastDateStr = uniqueDates[uniqueDates.length - 1] || '2024-12-31';
    const uniqueExerciseSet = new Set(logs.map(log => log.exerciseName));
    return {
      firstDate: formatDateShort(firstDateStr),
      lastDate: formatDateShort(lastDateStr),
      uniqueExercises: uniqueExerciseSet.size,
    };
  }, [data]);

  // Typewriter effect for header
  useEffect(() => {
    const fullText = 'MISSION LOG // TIMELINE';
    let currentIndex = 0;

    const getRandomDelay = (char: string) => {
      if (char === ' ') {
        return 100 + Math.random() * 200;
      }
      return 50 + Math.random() * 150;
    };

    const typeWriter = () => {
      if (currentIndex < fullText.length) {
        const currentChar = fullText[currentIndex];
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        const delay = getRandomDelay(currentChar);
        setTimeout(typeWriter, delay);
      }
    };

    const timer = setTimeout(typeWriter, 500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize SVG path lengths
  useEffect(() => {
    if (line1Ref.current && line2Ref.current) {
      const path1 = line1Ref.current;
      const path2 = line2Ref.current;
      const length1 = path1.getTotalLength();
      const length2 = path2.getTotalLength();
      
      // Set initial stroke-dasharray and stroke-dashoffset
      path1.style.strokeDasharray = `${length1}`;
      path1.style.strokeDashoffset = `${length1}`;
      path2.style.strokeDasharray = `${length2}`;
      path2.style.strokeDashoffset = `${length2}`;
    }
  }, []);

  // Animate SVG lines when nodes are activated
  useEffect(() => {
    if (activeNodes.includes(1) && line1Ref.current) {
      gsap.to(line1Ref.current, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.out',
      });
    }

    if (activeNodes.includes(2) && line2Ref.current) {
      gsap.to(line2Ref.current, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.out',
      });
    }
  }, [activeNodes]);

  // Animate cards when they appear
  useEffect(() => {
    if (activeNodes.includes(1) && card1Ref.current) {
      gsap.fromTo(
        card1Ref.current,
        {
          opacity: 0,
          scale: 0.8,
          filter: 'blur(10px)',
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power3.out',
        }
      );
    }

    if (activeNodes.includes(2) && card2Ref.current) {
      gsap.fromTo(
        card2Ref.current,
        {
          opacity: 0,
          scale: 0.8,
          filter: 'blur(10px)',
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power3.out',
        }
      );
    }

    if (activeNodes.includes(3) && card3Ref.current) {
      gsap.fromTo(
        card3Ref.current,
        {
          opacity: 0,
          scale: 0.8,
          filter: 'blur(10px)',
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power3.out',
        }
      );
    }
  }, [activeNodes]);

  // ScrollTrigger for visibility
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          setIsVisible(true);
        },
        onLeaveBack: () => {
          setIsVisible(false);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleNodeClick = (nodeNumber: number) => {
    // Check if previous nodes are activated
    if (nodeNumber === 1) {
      setActiveNodes([1]);
    } else if (nodeNumber === 2 && activeNodes.includes(1)) {
      setActiveNodes([1, 2]);
    } else if (nodeNumber === 3 && activeNodes.includes(2)) {
      setActiveNodes([1, 2, 3]);
    }
  };

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-label="Scale Slide - Mission timeline and scope"
      className="section-slide bg-background relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50"
    >
      {/* CSS Grid Container */}
      <div className="grid grid-cols-12 grid-rows-6 h-screen p-12 relative">
        {/* Header - Top Left, Grid Aligned */}
        <div ref={headerRef} className="col-start-1 row-start-1 z-20">
          <p className="font-mono text-sm uppercase tracking-widest text-foreground">
            {displayedText}
            <span className="text-[#CCFF00] animate-pulse">|</span>
          </p>
        </div>

        {/* SVG Lines - Energy Flow */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          {/* Line from Node 1 to Node 2 */}
          <path
            ref={line1Ref}
            d="M 75 33 L 25 50"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.5"
            fill="none"
            opacity={activeNodes.includes(1) ? 1 : 0}
            style={{ transition: 'opacity 0.3s' }}
          />
          {/* Line from Node 2 to Node 3 */}
          <path
            ref={line2Ref}
            d="M 25 50 L 67 83"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.5"
            fill="none"
            opacity={activeNodes.includes(2) ? 1 : 0}
            style={{ transition: 'opacity 0.3s' }}
          />
        </svg>

        {/* Node 1 - Top Right */}
        <button
          ref={node1Ref}
          onClick={() => handleNodeClick(1)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNodeClick(1);
            }
          }}
          className={`col-start-9 row-start-2 w-12 h-12 rounded-full border-[0.5px] flex items-center justify-center z-10 transition-all duration-300 justify-self-center self-center focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 rounded-full ${
            activeNodes.includes(1)
              ? 'border-[#CCFF00] shadow-[0_0_20px_#CCFF00]'
              : 'border-[#CCFF00]/50 hover:border-[#CCFF00]'
          }`}
        >
          <span
            className={`font-mono text-sm text-foreground ${
              activeNodes.includes(1) ? 'font-bold' : 'font-normal'
            }`}
          >
            1
          </span>
        </button>

        {/* Node 2 - Middle Left */}
        <button
          ref={node2Ref}
          onClick={() => handleNodeClick(2)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && activeNodes.includes(1)) {
              e.preventDefault();
              handleNodeClick(2);
            }
          }}
          disabled={!activeNodes.includes(1)}
          className={`col-start-3 row-start-3 w-12 h-12 rounded-full border-[0.5px] flex items-center justify-center z-10 transition-all duration-300 justify-self-center self-center focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 rounded-full ${
            activeNodes.includes(2)
              ? 'border-[#CCFF00] shadow-[0_0_20px_#CCFF00]'
              : activeNodes.includes(1)
              ? 'border-[#CCFF00]/50 hover:border-[#CCFF00] cursor-pointer'
              : 'border-white/20 opacity-50 cursor-not-allowed'
          }`}
        >
          <span
            className={`font-mono text-sm text-foreground ${
              activeNodes.includes(2) ? 'font-bold' : 'font-normal'
            }`}
          >
            2
          </span>
        </button>

        {/* Node 3 - Bottom Right */}
        <button
          ref={node3Ref}
          onClick={() => handleNodeClick(3)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && activeNodes.includes(2)) {
              e.preventDefault();
              handleNodeClick(3);
            }
          }}
          disabled={!activeNodes.includes(2)}
          className={`col-start-8 row-start-5 w-12 h-12 rounded-full border-[0.5px] flex items-center justify-center z-10 transition-all duration-300 justify-self-center self-center focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 rounded-full ${
            activeNodes.includes(3)
              ? 'border-[#CCFF00] shadow-[0_0_20px_#CCFF00]'
              : activeNodes.includes(2)
              ? 'border-[#CCFF00]/50 hover:border-[#CCFF00] cursor-pointer'
              : 'border-white/20 opacity-50 cursor-not-allowed'
          }`}
        >
          <span
            className={`font-mono text-sm text-foreground ${
              activeNodes.includes(3) ? 'font-bold' : 'font-normal'
            }`}
          >
            3
          </span>
        </button>

        {/* Reveal Card 1 - Total Load */}
        {activeNodes.includes(1) && (
          <div
            ref={card1Ref}
            className="col-start-10 col-span-2 row-start-2 backdrop-blur-md border-l border-[#CCFF00] pl-6 py-4 z-20 self-center"
          >
            <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-2">
              INITIATED
            </p>
            <h2 className="text-5xl font-display font-bold text-white tracking-tighter mb-1">
              {firstDate}
            </h2>
            <p className="text-xs font-mono text-gray-400">DAY 01</p>
          </div>
        )}

        {/* Reveal Card 2 - Time Invested */}
        {activeNodes.includes(2) && (
          <div
            ref={card2Ref}
            className="col-start-1 col-span-2 row-start-3 backdrop-blur-md border-l border-[#CCFF00] pl-6 py-4 z-20 self-center"
          >
            <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-2">
              LAST ACTIVE
            </p>
            <h2 className="text-5xl font-display font-bold text-white tracking-tighter mb-1">
              {lastDate}
            </h2>
            <p className="text-xs font-mono text-gray-400 mb-1">MISSION STATUS</p>
            <p className="text-xs font-mono text-[#CCFF00]">
              ONGOING
            </p>
          </div>
        )}

        {/* Reveal Card 3 - Sessions */}
        {activeNodes.includes(3) && (
          <div
            ref={card3Ref}
            className="col-start-10 col-span-2 row-start-5 backdrop-blur-md border-l border-[#CCFF00] pl-6 py-4 z-20 self-center"
          >
            <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-2">
              ARSENAL SIZE
            </p>
            <h2 className="text-5xl font-display font-bold text-white tracking-tighter mb-1">
              {uniqueExercises}
            </h2>
            <p className="text-xs font-mono text-[#CCFF00]">UNIQUE EXERCISES</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScaleSlide;
