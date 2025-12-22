/**
 * Exercise to Muscle Group Mapping
 * Maps exercise names to their primary muscle groups for visualization
 */

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';

/**
 * Direct mapping for common exercises
 * Based on the most frequent exercises in the dataset
 */
export const exerciseToMuscle: Record<string, MuscleGroup> = {
  // Chest exercises
  'Bench Press': 'Chest',
  'Incline Bench Press': 'Chest',
  'Decline Bench Press': 'Chest',
  'Dumbbell Press': 'Chest',
  'Incline Dumbbell Press': 'Chest',
  'Chest Press': 'Chest',
  'Chest Fly': 'Chest',
  'Pec Deck': 'Chest',
  'Push Up': 'Chest',
  'Cable Fly': 'Chest',
  
  // Back exercises
  'Lat Pulldown': 'Back',
  'Pull Up': 'Back',
  'Chin Up': 'Back',
  'Barbell Row': 'Back',
  'Dumbbell Row': 'Back',
  'Cable Row': 'Back',
  'T-Bar Row': 'Back',
  'Seated Row': 'Back',
  'Wide Grip Pulldown': 'Back',
  'Close Grip Pulldown': 'Back',
  'Deadlift': 'Back',
  'Romanian Deadlift': 'Back',
  'Bent Over Row': 'Back',
  'Lat Pulldown Wide': 'Back',
  'Lat Pulldown Close': 'Back',
  
  // Legs exercises
  'Squat': 'Legs',
  'Leg Press': 'Legs',
  'Leg Extension': 'Legs',
  'Leg Curl': 'Legs',
  'Lunges': 'Legs',
  'Bulgarian Split Squat': 'Legs',
  'Calf Raise': 'Legs',
  'Hack Squat': 'Legs',
  'Walking Lunges': 'Legs',
  
  // Shoulders exercises
  'Shoulder Press': 'Shoulders',
  'Overhead Press': 'Shoulders',
  'Lateral Raise': 'Shoulders',
  'Front Raise': 'Shoulders',
  'Rear Delt Fly': 'Shoulders',
  'Arnold Press': 'Shoulders',
  'Upright Row': 'Shoulders',
  'Face Pull': 'Shoulders',
  
  // Arms exercises
  'Bicep Curl': 'Arms',
  'Hammer Curl': 'Arms',
  'Tricep Extension': 'Arms',
  'Tricep Pushdown': 'Arms',
  'Cable Curl': 'Arms',
  'Preacher Curl': 'Arms',
  'Overhead Tricep Extension': 'Arms',
  'Dips': 'Arms',
  'Close Grip Bench Press': 'Arms',
  
  // Core exercises
  'Plank': 'Core',
  'Crunches': 'Core',
  'Sit Ups': 'Core',
  'Russian Twist': 'Core',
  'Leg Raises': 'Core',
};

/**
 * Helper function to determine muscle group from exercise name
 * Uses keyword matching as fallback when exercise is not in direct mapping
 */
export function getMuscleGroup(exerciseName: string): MuscleGroup {
  const normalized = exerciseName.toLowerCase().trim();
  
  // Check direct mapping first
  if (exerciseToMuscle[exerciseName]) {
    return exerciseToMuscle[exerciseName];
  }
  
  // Keyword-based fallback logic
  if (
    normalized.includes('press') && 
    (normalized.includes('bench') || normalized.includes('chest') || normalized.includes('pec'))
  ) {
    return 'Chest';
  }
  
  if (
    normalized.includes('press') && 
    (normalized.includes('shoulder') || normalized.includes('overhead'))
  ) {
    return 'Shoulders';
  }
  
  if (normalized.includes('curl')) {
    return 'Arms';
  }
  
  if (
    normalized.includes('pulldown') || 
    normalized.includes('pull up') || 
    normalized.includes('chin up') ||
    normalized.includes('row') ||
    normalized.includes('deadlift')
  ) {
    return 'Back';
  }
  
  if (
    normalized.includes('squat') || 
    normalized.includes('leg') || 
    normalized.includes('calf') ||
    normalized.includes('lunge')
  ) {
    return 'Legs';
  }
  
  if (
    normalized.includes('raise') && 
    (normalized.includes('lateral') || normalized.includes('front') || normalized.includes('rear'))
  ) {
    return 'Shoulders';
  }
  
  if (
    normalized.includes('tricep') || 
    normalized.includes('dip') ||
    (normalized.includes('extension') && normalized.includes('tricep'))
  ) {
    return 'Arms';
  }
  
  if (
    normalized.includes('plank') || 
    normalized.includes('crunch') || 
    normalized.includes('sit up') ||
    normalized.includes('core') ||
    normalized.includes('ab')
  ) {
    return 'Core';
  }
  
  // Default fallback: if it's a push movement, assume Chest/Shoulders
  if (normalized.includes('push') || normalized.includes('press')) {
    return 'Chest';
  }
  
  // Default fallback: if it's a pull movement, assume Back
  if (normalized.includes('pull')) {
    return 'Back';
  }
  
  // Ultimate fallback
  return 'Back';
}

