/**
 * 5-Act Narrative Structure Configuration
 * 
 * Defines the narrative structure of the Season of Grind presentation.
 * Each Act represents a thematic section of the story.
 */

export interface Act {
  id: number;
  label: string;
  name: string;
  description: string;
  startIndex: number; // 0-based slide index where the act starts
  endIndex: number;   // 0-based slide index where the act ends (inclusive)
  context: string;
}

export const ACTS: Act[] = [
  {
    id: 1,
    label: 'I',
    name: 'INITIALIZATION',
    description: 'System Boot',
    startIndex: 0,
    endIndex: 0,
    context: 'System Boot'
  },
  {
    id: 2,
    label: 'II',
    name: 'INTELLIGENCE',
    description: 'Data Analysis & Patterns',
    startIndex: 1,
    endIndex: 6,
    context: 'Data Analysis & Patterns'
  },
  {
    id: 3,
    label: 'III',
    name: 'OPERATIONS',
    description: 'The Physical Grind / The Arsenal',
    startIndex: 7,
    endIndex: 9,
    context: 'The Physical Grind / The Arsenal'
  },
  {
    id: 4,
    label: 'IV',
    name: 'IDENTITY',
    description: 'Personality & Operator Profile',
    startIndex: 10,
    endIndex: 11,
    context: 'Personality & Operator Profile'
  },
  {
    id: 5,
    label: 'V',
    name: 'DEBRIEF',
    description: 'Rewards & Shutdown',
    startIndex: 12,
    endIndex: 13,
    context: 'Rewards & Shutdown'
  }
];

/**
 * Get the Act for a given slide index
 */
export function getActForSlide(slideIndex: number): Act | null {
  return ACTS.find(act => slideIndex >= act.startIndex && slideIndex <= act.endIndex) || null;
}

/**
 * Get checkpoint indices (start of each act)
 */
export function getCheckpointIndices(): number[] {
  return ACTS.map(act => act.startIndex);
}

