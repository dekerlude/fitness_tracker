export interface ExerciseAlternative {
  exerciseId: string;
  name: string;
  equipment: string;
}

export interface Exercise {
  id: string;
  name: string;
  day: number;
  order: number;
  category: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  sets: number;
  repRange: string;
  instructions: string[];
  gymAvailability?: string;
  alternatives?: ExerciseAlternative[];
  equipmentNote?: string;
}

export interface WorkoutDay {
  day: number;
  name: string;
  shortName: string;
  focus: string[];
  exerciseIds: string[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  version: string;
  daysPerWeek: number;
  restDays: number[];
  goal: string;
  notes: string[];
}

export interface WorkoutPlan {
  program: WorkoutProgram;
  days: WorkoutDay[];
}

// Workout History Types
export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface CompletedExercise {
  exerciseId: string;
  actualExerciseId: string;
  sets: CompletedSet[];
}

export interface WorkoutHistoryEntry {
  id: string; // unique identifier for deletion
  date: string; // ISO string
  workoutId: number; // day number
  duration: number; // in seconds
  exercises: CompletedExercise[];
}

// --- Legacy Types to prevent broken unused components ---
export interface WorkoutLog {}
export interface BodyLog {}
export interface UserProfile {
  name: string;
  age: string;
  height: string;
  sex: string;
}
export interface LogSet {}
export type EquipmentType = any;

