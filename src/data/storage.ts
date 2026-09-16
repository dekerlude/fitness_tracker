export const KEYS = {
  USER: 'lpb_user',
  ACTIVITY: 'lpb_activity',
  MONTHLY_TOTALS: 'lpb_monthly_totals',
  EXERCISE_PROGRESS: 'lpb_exercise_progress',
  SETTINGS: 'lpb_settings',
  STREAK: 'lpb_streak',
  HISTORY: 'lpb_workout_history' // legacy key used by api.ts
};

// Types
export type ActivityRecord = Record<string, string[]>; // { "YYYY-MM": ["01", "02"] }
export type MonthlyTotals = Record<string, number>;    // { "YYYY-MM": 26 }

export interface ExerciseProgress {
  [exerciseId: string]: {
    sets: Array<{ weight: number; reps: number }>;
    lastPerformed: string;
  };
}

export interface StreakState {
  currentStreak: number;
  lastWorkoutDate: string | null; // "YYYY-MM-DD"
}

// Safe localStorage access
export function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${key} from localStorage`, e);
  }
}

// Date Utilities (Local Timezone)
export function getLocalDateKey(timestamp: string | number | Date): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getLocalMonthKey(timestamp: string | number | Date): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getLocalDay(timestamp: string | number | Date): string {
  const d = new Date(timestamp);
  return String(d.getDate()).padStart(2, '0');
}

export function processMonthRollover(): void {
  // Migrate exercise progress schema if needed
  const progress = getStorage<any>(KEYS.EXERCISE_PROGRESS, {});
  let progressModified = false;
  for (const exId in progress) {
    if (progress[exId].last && !progress[exId].sets) {
      // Migrate old format to new format
      progress[exId] = {
        sets: [
          { weight: progress[exId].last.weight, reps: progress[exId].last.reps }
        ],
        lastPerformed: getLocalDateKey(Date.now())
      };
      progressModified = true;
    }
  }
  if (progressModified) {
    setStorage(KEYS.EXERCISE_PROGRESS, progress);
  }

  const activity = getStorage<ActivityRecord>(KEYS.ACTIVITY, {});
  const totals = getStorage<MonthlyTotals>(KEYS.MONTHLY_TOTALS, {});
  
  const currentMonthKey = getLocalMonthKey(Date.now());
  let modified = false;

  for (const monthKey in activity) {
    if (monthKey < currentMonthKey) {
      // It's a past month. Count unique days, store in totals.
      const uniqueDaysCount = new Set(activity[monthKey]).size;
      totals[monthKey] = uniqueDaysCount;
      delete activity[monthKey];
      modified = true;
    }
  }

  if (modified) {
    setStorage(KEYS.ACTIVITY, activity);
    setStorage(KEYS.MONTHLY_TOTALS, totals);
  }
}

export function deleteWorkoutRecord(recordId: string): boolean {
  try {
    const rawHistory = localStorage.getItem(KEYS.HISTORY);
    if (!rawHistory) return false;
    
    let history: any[] = JSON.parse(rawHistory);
    const targetIndex = history.findIndex((h: any) => h.id === recordId);
    
    if (targetIndex === -1) return false;
    
    const targetRecord = history[targetIndex];
    const targetDate = new Date(targetRecord.date);
    const targetDateKey = getLocalDateKey(targetDate);
    const targetMonthKey = getLocalMonthKey(targetDate);
    const targetDayStr = getLocalDay(targetDate);
    
    // Remove from history
    history.splice(targetIndex, 1);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    
    // Check if any other workout exists on this EXACT local date
    const stillHasWorkoutOnDate = history.some((h: any) => getLocalDateKey(h.date) === targetDateKey);
    
    if (!stillHasWorkoutOnDate) {
      // 1. Remove from lpb_activity if it's the current month
      const activity = getStorage<ActivityRecord>(KEYS.ACTIVITY, {});
      if (activity[targetMonthKey]) {
        activity[targetMonthKey] = activity[targetMonthKey].filter(d => d !== targetDayStr);
        setStorage(KEYS.ACTIVITY, activity);
      }
      
      // 2. Decrement monthly totals if it was archived
      const totals = getStorage<MonthlyTotals>(KEYS.MONTHLY_TOTALS, {});
      if (totals[targetMonthKey] !== undefined) {
        totals[targetMonthKey] = Math.max(0, totals[targetMonthKey] - 1);
        setStorage(KEYS.MONTHLY_TOTALS, totals);
      }
      
      // 3. Recalculate streak
      const uniqueDates = Array.from(new Set(history.map((h: any) => getLocalDateKey(h.date)))).sort();
      let streak = 0;
      let lastWorkoutDate = null;
      
      if (uniqueDates.length > 0) {
        streak = 1;
        lastWorkoutDate = uniqueDates[uniqueDates.length - 1];
        for (let i = uniqueDates.length - 1; i > 0; i--) {
          const curr = new Date(uniqueDates[i]).getTime();
          const prev = new Date(uniqueDates[i-1]).getTime();
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1 || diffDays === 2) { 
            streak++;
          } else if (diffDays > 2) {
            break;
          }
        }
      }
      
      setStorage(KEYS.STREAK, { currentStreak: streak, lastWorkoutDate });
    }
    
    return true;
  } catch (err) {
    console.error("Failed to delete workout record:", err);
    return false;
  }
}

