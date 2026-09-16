import { useState, useEffect } from 'react';
import { Exercise, CompletedExercise, WorkoutHistoryEntry } from '../types';
import { api } from '../data/api';
import { KEYS, getStorage, setStorage, getLocalMonthKey, getLocalDay, getLocalDateKey, ActivityRecord, ExerciseProgress, StreakState } from '../data/storage';

export function useWorkoutSession(day: number) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0); // Optional: can be derived from completedExercises
  
  const [startTime, setStartTime] = useState<number>(0);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  useEffect(() => {
    setExercises(api.getExercisesForWorkout(day));
    setStartTime(Date.now());
  }, [day]);

  const currentExercise = exercises[currentExerciseIndex];

  // Helper to get current sets completed for the current exercise
  const currentCompletedExercise = completedExercises.find(
    ce => ce.exerciseId === currentExercise?.id
  );
  const setsCompletedCount = currentCompletedExercise?.sets.length || 0;

  const completeSet = (reps: number, weight: number) => {
    if (!currentExercise) return;
    
    setCompletedExercises(prev => {
      const existing = prev.find(e => e.exerciseId === currentExercise.id);
      if (existing) {
        return prev.map(e => 
          e.exerciseId === currentExercise.id 
            ? { ...e, sets: [...e.sets, { setNumber: setsCompletedCount + 1, reps, weight, completed: true }] }
            : e
        );
      } else {
        return [...prev, {
          exerciseId: currentExercise.id,
          actualExerciseId: currentExercise.id,
          sets: [{ setNumber: 1, reps, weight, completed: true }]
        }];
      }
    });

    if (setsCompletedCount + 1 >= currentExercise.sets) {
      // Exercise is fully complete
      if (currentExerciseIndex + 1 < exercises.length) {
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        setWorkoutComplete(true);
      }
    }
  };

  const swapExercise = (newExerciseId: string) => {
    const newEx = api.getExerciseById(newExerciseId);
    if (newEx) {
      setExercises(prev => {
        const copy = [...prev];
        copy[currentExerciseIndex] = newEx;
        return copy;
      });
    }
  };

  const finishWorkout = () => {
    const now = Date.now();
    const durationSeconds = Math.round((now - startTime) / 1000);
    
    const entry: WorkoutHistoryEntry = {
      id: now.toString() + Math.random().toString(36).substr(2, 9),
      date: new Date(now).toISOString(),
      workoutId: day,
      duration: durationSeconds,
      exercises: completedExercises
    };
    api.saveWorkoutToHistory(entry);
    
    // Update Monthly Activity
    const monthKey = getLocalMonthKey(now);
    const dayStr = getLocalDay(now);
    const activity = getStorage<ActivityRecord>(KEYS.ACTIVITY, {});
    
    if (!activity[monthKey]) activity[monthKey] = [];
    if (!activity[monthKey].includes(dayStr)) {
      activity[monthKey].push(dayStr);
      setStorage(KEYS.ACTIVITY, activity);

      // Update Streak ONLY IF this is a new active day
      const dateKey = getLocalDateKey(now);
      const streakObj = getStorage<StreakState>(KEYS.STREAK, { currentStreak: 0, lastWorkoutDate: null });
      
      if (streakObj.lastWorkoutDate) {
         const curr = new Date(dateKey).getTime();
         const prev = new Date(streakObj.lastWorkoutDate).getTime();
         const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
         if (diffDays === 1 || diffDays === 2) {
           streakObj.currentStreak += 1;
         } else if (diffDays > 2) {
           streakObj.currentStreak = 1;
         }
      } else {
         streakObj.currentStreak = 1;
      }
      streakObj.lastWorkoutDate = dateKey;
      setStorage(KEYS.STREAK, streakObj);
    }

    // Update Exercise Progress
    const progress = getStorage<ExerciseProgress>(KEYS.EXERCISE_PROGRESS, {});
    completedExercises.forEach(ce => {
       const setsToSave = ce.sets.map(s => ({ weight: s.weight, reps: s.reps }));
       if (setsToSave.length > 0) {
         progress[ce.exerciseId] = {
           sets: setsToSave,
           lastPerformed: getLocalDateKey(now)
         };
       }
    });
    setStorage(KEYS.EXERCISE_PROGRESS, progress);
  };

  return {
    exercises,
    currentExerciseIndex,
    currentExercise,
    setsCompletedCount,
    workoutComplete,
    completedExercises,
    completeSet,
    swapExercise,
    finishWorkout
  };
}
