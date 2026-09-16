import { Exercise, WorkoutPlan, WorkoutDay, WorkoutHistoryEntry, UserProfile } from '../types';
import exercisesData from './exercises.json';
import workoutPlanData from './workoutPlan.json';

const exercises: Exercise[] = exercisesData as Exercise[];
const workoutPlan: WorkoutPlan = workoutPlanData as WorkoutPlan;
const HISTORY_KEY = 'lpb_workout_history';

export const api = {
  getUserProfile: (): UserProfile | null => {
    const raw = localStorage.getItem('lpb_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  
  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem('lpb_user', JSON.stringify(profile));
  },

  getExerciseById: (id: string): Exercise | undefined => {
    return exercises.find(ex => ex.id === id);
  },
  
  getExerciseByName: (name: string): Exercise | undefined => {
    return exercises.find(ex => ex.name.toLowerCase() === name.toLowerCase());
  },
  
  getWorkoutByDay: (day: number): WorkoutDay | undefined => {
    return workoutPlan.days.find(d => d.day === day);
  },
  
  getExercisesForWorkout: (day: number): Exercise[] => {
    const workoutDay = api.getWorkoutByDay(day);
    if (!workoutDay || workoutDay.exerciseIds.length === 0) return [];
    
    return workoutDay.exerciseIds
      .map(id => api.getExerciseById(id))
      .filter((ex): ex is Exercise => ex !== undefined);
  },
  
  getAllExercises: (): Exercise[] => {
    return exercises;
  },
  
  getWorkoutPlan: (): WorkoutPlan => {
    return workoutPlan;
  },

  getWorkoutHistory: (): WorkoutHistoryEntry[] => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as WorkoutHistoryEntry[];
      let modified = false;
      const verified = parsed.map((entry, index) => {
        if (!entry.id) {
          modified = true;
          return { ...entry, id: `legacy-${index}-${new Date(entry.date).getTime()}` };
        }
        return entry;
      });
      if (modified) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(verified));
      }
      return verified;
    } catch {
      return [];
    }
  },

  saveWorkoutToHistory: (entry: WorkoutHistoryEntry) => {
    const history = api.getWorkoutHistory();
    history.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  getNextWorkoutDay: (): number => {
    const history = api.getWorkoutHistory();
    if (history.length === 0) return 1;
    
    const lastWorkout = history[history.length - 1];
    let nextDay = lastWorkout.workoutId + 1;
    if (nextDay > 7) nextDay = 1; // Assuming 7 day cycle

    // Skip rest days
    let iterations = 0;
    while (iterations < 7) {
      const dayPlan = api.getWorkoutByDay(nextDay);
      if (dayPlan && dayPlan.exerciseIds.length > 0) {
        return nextDay;
      }
      nextDay++;
      if (nextDay > 7) nextDay = 1;
      iterations++;
    }
    return 1;
  },

  getCurrentCalendarWorkoutDay: (): number => {
    // JavaScript getDay(): 0 = Sunday, 1 = Monday, 6 = Saturday
    // We want: 1 = Monday, ..., 7 = Sunday
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
  },

  getLocalDateKey: (timestamp: string | number | Date): string => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
};
