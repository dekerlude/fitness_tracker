import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutDay, LogSet, WorkoutLog, ExerciseLog, Exercise, EquipmentType } from '../types';
import { MASTER_EXERCISES } from '../data/exercises';
import { Play, Check, AlertCircle } from 'lucide-react';
import { ActiveExerciseItem } from './ActiveExerciseItem';
import { RestTimerFloating } from './RestTimerFloating';

interface WorkoutActiveProps {
  workoutDay: WorkoutDay;
  logs: WorkoutLog[];
  equipment: EquipmentType;
  onCancel: () => void;
  onSave: (completedLog: WorkoutLog) => void;
}

export default function WorkoutActive({ workoutDay, logs, equipment, onCancel, onSave }: WorkoutActiveProps) {
  // Mobility warm-up checklist state
  const [showWarmup, setShowWarmup] = useState(true);
  const [warmupChecked, setWarmupChecked] = useState<Record<string, boolean>>({
    armCircles: false,
    rotatorCuff: false,
    legSwings: false,
    scapularPulls: false,
    emptyBarWarmup: false,
  });

  // State of current exercises in this active session
  const [exercisesList, setExercisesList] = useState<{ exercise: Exercise; sets: LogSet[] }[]>([]);

  // Track trigger events for our isolated Rest Timer Floating component
  const [restTimerTrigger, setRestTimerTrigger] = useState<{ duration: number; timestamp: number } | null>(null);

  // Time logging (no timer seconds state here to avoid re-renders)
  const [sessionStartTime] = useState<number>(Date.now());

  // Reference for previous workouts to fetch "Last Time" values
  const getPreviousSessionStats = useCallback((exId: string): string => {
    // Find the last completed workout that contained this exercise
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const log of sortedLogs) {
      const exLog = log.exercises.find(e => e.exerciseId === exId);
      if (exLog && exLog.sets.some(s => s.completed)) {
        const compSets = exLog.sets.filter(s => s.completed);
        const setStrings = compSets.map(s => `${s.weight}kg x ${s.reps}`).join(', ');
        return `Last time: ${setStrings}`;
      }
    }
    return 'First time logging this!';
  }, [logs]);

  // Initialize exercises list from workoutDay
  useEffect(() => {
    const list = workoutDay.exercises.map(ex => {
      const defaultSetsArray: LogSet[] = Array.from({ length: ex.defaultSets }, (_, i) => {
        // Try to get weight reference from previous log of this exercise, or default to some light weight
        let lastWeight = 20; // default empty barbell
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        for (const log of sortedLogs) {
          const exLog = log.exercises.find(e => e.exerciseId === ex.id);
          if (exLog && exLog.sets.length > i) {
            lastWeight = exLog.sets[i].weight;
            break;
          } else if (exLog && exLog.sets.length > 0) {
            lastWeight = exLog.sets[0].weight;
            break;
          }
        }

        return {
          id: `set_${ex.id}_${i}_${Date.now()}`,
          weight: lastWeight,
          reps: ex.repsRange.max, // default to top of range
          rpe: 8, // solid standard rpe
          completed: false
        };
      });

      return {
        exercise: ex,
        sets: defaultSetsArray
      };
    });

    setExercisesList(list);
  }, [workoutDay, logs]);

  // Log set changes
  const handleUpdateSet = useCallback((exIndex: number, setIndex: number, fields: Partial<LogSet>) => {
    setExercisesList(prev => {
      const list = [...prev];
      list[exIndex] = {
        ...list[exIndex],
        sets: [...list[exIndex].sets]
      };
      list[exIndex].sets[setIndex] = {
        ...list[exIndex].sets[setIndex],
        ...fields
      };
      return list;
    });
  }, []);

  const toggleSetComplete = useCallback((exIndex: number, setIndex: number) => {
    setExercisesList(prev => {
      const list = [...prev];
      list[exIndex] = {
        ...list[exIndex],
        sets: [...list[exIndex].sets]
      };
      const set = list[exIndex].sets[setIndex];
      const newStatus = !set.completed;
      
      list[exIndex].sets[setIndex] = {
        ...set,
        completed: newStatus
      };

      // If marked complete, trigger appropriate rest timer in the isolated footer component
      if (newStatus) {
        const ex = list[exIndex].exercise;
        const isCompound = ['flat_bench_press', 'overhead_press', 'deadlift', 'barbell_row', 'squats', 'front_squat'].includes(ex.id);
        const restSec = isCompound ? 120 : 60; // 2 min for compounds, 1 min for isolation
        setRestTimerTrigger({ duration: restSec, timestamp: Date.now() });
      }

      return list;
    });
  }, []);

  // Add a set dynamically
  const handleAddSet = useCallback((exIndex: number) => {
    setExercisesList(prev => {
      const list = [...prev];
      const ex = list[exIndex].exercise;
      const lastSet = list[exIndex].sets[list[exIndex].sets.length - 1];
      
      list[exIndex] = {
        ...list[exIndex],
        sets: [
          ...list[exIndex].sets,
          {
            id: `set_${ex.id}_${list[exIndex].sets.length}_${Date.now()}`,
            weight: lastSet ? lastSet.weight : 20,
            reps: lastSet ? lastSet.reps : ex.repsRange.max,
            rpe: lastSet ? lastSet.rpe : 8,
            completed: false
          }
        ]
      };
      return list;
    });
  }, []);

  // Delete last set
  const handleRemoveSet = useCallback((exIndex: number) => {
    setExercisesList(prev => {
      const list = [...prev];
      if (list[exIndex].sets.length > 1) {
        list[exIndex] = {
          ...list[exIndex],
          sets: list[exIndex].sets.slice(0, -1)
        };
      }
      return list;
    });
  }, []);

  // Swap exercise inside active workout
  const handleSwapActiveExercise = useCallback((exIndex: number) => {
    setExercisesList(prev => {
      const list = [...prev];
      const oldEx = list[exIndex].exercise;
      
      const alternatives = MASTER_EXERCISES.filter(ex => 
        ex.muscleGroup === oldEx.muscleGroup && 
        ex.id !== oldEx.id &&
        (equipment === 'gym' || ex.equipmentRequired === equipment || ex.equipmentRequired === 'bodyweight')
      );

      if (alternatives.length === 0) {
        alert("No available alternatives found for this equipment tier.");
        return prev;
      }

      const names = alternatives.map((a, i) => `${i + 1}. ${a.name}`).join('\n');
      const input = prompt(`Choose an alternative exercise to swap with "${oldEx.name}":\n\n${names}\n\nEnter number to select:`);
      
      if (input) {
        const selectedIndex = parseInt(input) - 1;
        if (selectedIndex >= 0 && selectedIndex < alternatives.length) {
          const newEx = alternatives[selectedIndex];
          list[exIndex] = {
            exercise: newEx,
            sets: list[exIndex].sets.map(set => ({
              ...set,
              weight: 20,
              completed: false
            }))
          };
          return list;
        }
      }
      return prev;
    });
  }, [equipment]);

  // Check if progressive overload criteria is met for any exercise:
  const getOverloadAdvice = useCallback((ex: Exercise, sets: LogSet[]): string | null => {
    const completedSets = sets.filter(s => s.completed);
    if (completedSets.length === 0) return null;

    const hitTopRange = completedSets.every(s => s.reps >= ex.repsRange.max);
    if (hitTopRange) {
      return `🎉 Overload Triggered! You hit the top rep range (${ex.repsRange.max}) on all sets. Increase weight by 1-2.5 kg next time!`;
    }
    return null;
  }, []);

  // Complete workout logging
  const handleSaveWorkout = () => {
    const completedExercises: ExerciseLog[] = exercisesList
      .filter(item => item.sets.some(s => s.completed))
      .map(item => ({
        exerciseId: item.exercise.id,
        exerciseName: item.exercise.name,
        sets: item.sets.filter(s => s.completed)
      }));

    if (completedExercises.length === 0) {
      alert("Please log at least one completed set before saving!");
      return;
    }

    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

    const log: WorkoutLog = {
      id: `log_${Date.now()}`,
      workoutDayId: workoutDay.id,
      workoutDayName: workoutDay.name,
      date: new Date().toISOString().slice(0, 10),
      exercises: completedExercises,
      durationMinutes: elapsedMinutes,
      deload: false
    };

    onSave(log);
  };

  const isWarmupComplete = Object.values(warmupChecked).every(val => val === true);

  return (
    <div className="space-y-6">
      {/* 1. Warm-up Screen Modal overlay or collapse */}
      {showWarmup ? (
        <div className="bg-zinc-900/60 border border-zinc-800/85 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-start border-b border-zinc-800/60 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5 text-orange-500 animate-bounce" />
                Preserve Lean Joints: Warm-Up
              </h2>
              <p className="text-zinc-500 text-[11px] mt-0.5">Protect tendons and prime neural path systems before lifting heavy weights.</p>
            </div>
            <button
              onClick={() => setShowWarmup(false)}
              className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800"
            >
              Skip Warm-up
            </button>
          </div>

          <div className="space-y-3">
            {[
              { key: 'armCircles', label: '10x Arm Circles & Shoulder Rolls (Increases synovial fluid)' },
              { key: 'rotatorCuff', label: '10x Rotator Cuff Internal/External Rotations (Primarily for Push/Pull)' },
              { key: 'legSwings', label: '10x Leg Swings & Hip Hinge stretch (Leg Day essential)' },
              { key: 'scapularPulls', label: '10x Scapular Pulls / Doorway stretches (Primes lats)' },
              { key: 'emptyBarWarmup', label: '1-2 warm-up sets with an empty bar / light bodyweight' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900/80 cursor-pointer hover:bg-zinc-900/40 transition-all select-none"
              >
                <input
                  type="checkbox"
                  checked={warmupChecked[item.key]}
                  onChange={() => setWarmupChecked(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="w-4 h-4 rounded border-zinc-800 text-blue-600 bg-zinc-900 focus:ring-0 focus:ring-offset-0"
                />
                <span className={`text-xs ${warmupChecked[item.key] ? 'text-zinc-500 line-through' : 'text-zinc-300 font-medium'}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={() => setShowWarmup(false)}
            disabled={!isWarmupComplete}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Play className="w-4 h-4" />
            Begin Workout Routine
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/60">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Active Gym Workout:</span>
              <h2 className="text-sm font-black text-white">{workoutDay.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkout}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-all shadow flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Finish Workout
              </button>
            </div>
          </div>

          {/* Active Workout Exercises List */}
          <div className="space-y-6">
            {exercisesList.map((item, exIdx) => (
              <ActiveExerciseItem
                key={item.exercise.id}
                exIdx={exIdx}
                exercise={item.exercise}
                sets={item.sets}
                advice={getOverloadAdvice(item.exercise, item.sets)}
                previousStats={getPreviousSessionStats(item.exercise.id)}
                onUpdateSet={handleUpdateSet}
                onToggleSetComplete={toggleSetComplete}
                onAddSet={handleAddSet}
                onRemoveSet={handleRemoveSet}
                onSwapExercise={handleSwapActiveExercise}
              />
            ))}
          </div>
        </div>
      )}

      {/* Isolated Persistent floating rest-timer block (doesn't trigger parent re-renders) */}
      {!showWarmup && (
        <RestTimerFloating trigger={restTimerTrigger} />
      )}
    </div>
  );
}
