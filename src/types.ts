export type EquipmentType = 'bodyweight' | 'dumbbell' | 'gym';

export interface UserProfile {
  weight: number; // in kg
  height: number; // in cm
  goal: string; // e.g. "lean muscle / aesthetic physique"
  split: string; // e.g. "PPL, 6 days/week"
  equipment: EquipmentType;
  proteinPerKg: number; // e.g. 2.0
  customCaloriesGoal?: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'chest' | 'shoulders' | 'triceps' | 'back' | 'biceps' | 'quads' | 'hamstrings' | 'calves' | 'rear-delts-traps' | 'core';
  category: 'Push' | 'Pull' | 'Legs';
  defaultSets: number;
  repsRange: { min: number; max: number };
  instructions: string;
  alternativeName: string;
  alternativeInstruction: string;
  equipmentRequired: EquipmentType;
}

export interface WorkoutDay {
  id: string; // e.g. "push_a", "push_b", "pull_a", etc.
  name: string; // "Push A", "Push B"
  category: 'Push' | 'Pull' | 'Legs';
  exercises: Exercise[];
}

export interface LogSet {
  id: string;
  weight: number;
  reps: number;
  rpe: number; // 1-10 or reps in reserve
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: LogSet[];
}

export interface WorkoutLog {
  id: string;
  workoutDayId: string;
  workoutDayName: string;
  date: string; // YYYY-MM-DD
  exercises: ExerciseLog[];
  durationMinutes: number;
  deload: boolean;
}

export interface BodyLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  waist?: number;
  chest?: number;
  arms?: number;
  photoUrl?: string; // Base64 or local URL for local storage
}

export interface WorkoutHistory {
  logs: WorkoutLog[];
  bodyLogs: BodyLog[];
  streakCount: number;
}
