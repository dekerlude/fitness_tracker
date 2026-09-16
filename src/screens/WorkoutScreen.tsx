import React, { useState, useEffect } from 'react';
import { api } from '../data/api';
import { KEYS, getStorage, ExerciseProgress } from '../data/storage';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { GlassCard } from '../components/ui/GlassCard';
import { PrimaryAction } from '../components/ui/PrimaryAction';
import { Check, ChevronLeft, X } from 'lucide-react';

interface WorkoutScreenProps {
  onFinishWorkout: () => void;
}

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ onFinishWorkout }) => {
  const currentDay = api.getCurrentCalendarWorkoutDay();
  const workoutDay = api.getWorkoutByDay(currentDay);
  const [showAlternatives, setShowAlternatives] = useState(false);
  
  // Track input state for the current active set
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentReps, setCurrentReps] = useState<string>('');

  const {
    exercises,
    currentExerciseIndex,
    currentExercise,
    setsCompletedCount,
    completedExercises,
    completeSet,
    swapExercise,
    finishWorkout,
    workoutComplete
  } = useWorkoutSession(currentDay);

  const [progress] = useState(() => getStorage<ExerciseProgress>(KEYS.EXERCISE_PROGRESS, {}));

  // Smart Pre-filling logic
  useEffect(() => {
    if (!currentExercise) return;
    
    let defaultWeight = '';
    let defaultReps = '';
    
    const exProgress = progress[currentExercise.id];
    const currentCompleted = completedExercises.find(ce => ce.exerciseId === currentExercise.id);
    const lastCurrentSet = currentCompleted?.sets[currentCompleted.sets.length - 1];
    
    if (exProgress && exProgress.sets[setsCompletedCount]) {
       // Match exact set index from previous performance
       defaultWeight = String(exProgress.sets[setsCompletedCount].weight);
       defaultReps = String(exProgress.sets[setsCompletedCount].reps);
    } else if (lastCurrentSet) {
       // Fallback to most recently completed set in CURRENT workout
       defaultWeight = String(lastCurrentSet.weight);
       defaultReps = String(lastCurrentSet.reps);
    } else if (exProgress && exProgress.sets.length > 0) {
       // Fallback to the last set from PREVIOUS workout
       const lastPrevSet = exProgress.sets[exProgress.sets.length - 1];
       defaultWeight = String(lastPrevSet.weight);
       defaultReps = String(lastPrevSet.reps);
    } else {
       // Absolute fallback
       defaultReps = currentExercise.repRange.split('-')[0] || '';
    }
    
    setCurrentWeight(defaultWeight);
    setCurrentReps(defaultReps);
  }, [currentExerciseIndex, setsCompletedCount, currentExercise]);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="flex flex-col min-h-screen px-6 py-12 justify-center text-center">
        <p className="text-xl text-secondary mb-12">No exercises found for this workout.</p>
        <PrimaryAction onClick={onFinishWorkout}>Back to Home</PrimaryAction>
      </div>
    );
  }

  if (workoutComplete) {
    return (
      <div className="flex flex-col min-h-screen px-6 py-12 justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/10 blur-[100px] pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-bold font-display uppercase tracking-tight text-white mb-10 relative z-10">
          Workout Complete
        </h1>
        <div className="flex justify-center gap-8 mb-12 relative z-10">
          <div className="flex flex-col">
            <span className="text-4xl font-display font-bold text-white mb-1">{exercises.length}</span>
            <span className="text-secondary text-xs uppercase tracking-widest font-bold">Exercises</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-display font-bold text-white mb-1">
              {exercises.reduce((acc, ex) => acc + ex.sets, 0)}
            </span>
            <span className="text-secondary text-xs uppercase tracking-widest font-bold">Sets</span>
          </div>
        </div>
        <p className="text-xl text-secondary mb-12 relative z-10">Great work.</p>
        <PrimaryAction onClick={() => { finishWorkout(); onFinishWorkout(); }} className="mb-4 relative z-10">Back to Home</PrimaryAction>
      </div>
    );
  }

  const handleCompleteSet = () => {
    const weightVal = parseFloat(currentWeight) || 0;
    const repsVal = parseInt(currentReps) || (parseInt(currentExercise.repRange.split('-')[0]) || 10);
    completeSet(repsVal, weightVal);
    // Reset inputs for next set
    setCurrentWeight('');
    setCurrentReps('');
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-8 relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onFinishWorkout} className="text-white hover:text-accent transition-colors flex items-center p-2 -ml-2">
          <ChevronLeft size={28} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase mb-1">{workoutDay?.shortName}</span>
          <span className="font-medium text-white text-sm">{currentExerciseIndex + 1} / {exercises.length} Exercises</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Exercise Info */}
      <GlassCard className="mb-8 p-6 border-white/5 relative bg-card/80 backdrop-blur-md">
         <div className="flex justify-between items-start mb-6">
           <div>
             <h2 className="text-2xl font-bold font-display uppercase tracking-tight text-white mb-1">
               {currentExercise.name}
             </h2>
             <div className="flex gap-3 text-xs font-bold tracking-widest uppercase text-accent mt-2">
               <span>{currentExercise.primaryMuscle.replace('_', ' ')}</span>
               <span className="text-secondary">•</span>
               <span className="text-secondary">{currentExercise.equipment}</span>
             </div>
           </div>
           
           {currentExercise?.alternatives && currentExercise.alternatives.length > 0 && (
              <button 
                onClick={() => setShowAlternatives(true)}
                className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors shrink-0"
              >
                Can't do this?
              </button>
           )}
         </div>

         <div className="flex flex-wrap gap-x-6 gap-y-4 mb-6 border-y border-white/5 py-4">
           <div className="flex flex-col">
             <span className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">Target</span>
             <span className="text-white font-medium">{currentExercise.sets} Sets × {currentExercise.repRange} Reps</span>
           </div>
         </div>
         
         {/* Instructions */}
         {currentExercise.instructions && currentExercise.instructions.length > 0 && (
            <div>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-2 block">Instructions</span>
              <ul className="text-secondary text-sm space-y-1 list-disc pl-4">
                {currentExercise.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>
         )}
      </GlassCard>

      {/* Sets */}
      <div className="flex flex-col gap-3 flex-1 pb-24">
        {Array.from({ length: currentExercise.sets }).map((_, idx) => {
          const isCompleted = idx < setsCompletedCount;
          const isCurrent = idx === setsCompletedCount;
          
          const exProgress = progress[currentExercise.id];
          const previousSetRecord = exProgress?.sets[idx];
          
          return (
            <div key={idx} className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
              isCurrent ? 'bg-card border border-accent/30 glow-subtle' : 'bg-card/50 border border-transparent'
            }`}>
              <div className={`p-5 flex flex-col ${isCompleted ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCurrent ? 'bg-accent text-white' : 'bg-white/10 text-secondary'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-secondary text-sm font-medium">Target: {currentExercise.repRange} reps</span>
                  </div>
                  {isCompleted && (
                    <div className="text-accent flex items-center gap-1 font-bold text-xs uppercase tracking-wider">
                      <Check size={16} strokeWidth={3} /> SET {idx + 1} COMPLETED
                    </div>
                  )}
                </div>
                
                {isCurrent && (
                  <div className="flex flex-col gap-4 mt-2">
                    {previousSetRecord && (
                      <div className="flex justify-end mb-1">
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                          PREVIOUS: {previousSetRecord.weight} kg × {previousSetRecord.reps}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-secondary font-bold uppercase tracking-widest ml-1">Weight (kg/lbs)</label>
                        <input 
                          type="number" 
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                          placeholder="0"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-secondary font-bold uppercase tracking-widest ml-1">Reps</label>
                        <input 
                          type="number" 
                          value={currentReps}
                          onChange={(e) => setCurrentReps(e.target.value)}
                          placeholder={currentExercise.repRange.split('-')[0] || "0"}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                    </div>
                    <PrimaryAction onClick={handleCompleteSet} className="!mt-2 !py-3">
                      Complete Set
                    </PrimaryAction>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alternatives Modal */}
      {showAlternatives && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAlternatives(false)} />
          <GlassCard className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 p-0 overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-card">
              <h3 className="font-display font-bold uppercase tracking-wider text-white">Alternative Exercise</h3>
              <button onClick={() => setShowAlternatives(false)} className="text-secondary hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto bg-black/40 p-2">
              {currentExercise?.alternatives?.map((alt, i) => (
                <div key={i} className="flex flex-col p-4 mb-2 bg-card/50 rounded-xl border border-white/5">
                  <div className="mb-4">
                    <h4 className="font-bold text-white mb-1 text-lg">{alt.name}</h4>
                    <p className="text-xs text-secondary tracking-widest uppercase">{alt.equipment}</p>
                  </div>
                  <PrimaryAction 
                    variant="glass" 
                    className="!py-2.5 !text-sm"
                    onClick={() => {
                      const resolved = api.getExerciseById(alt.exerciseId);
                      if (resolved) {
                        swapExercise(resolved.id);
                        setShowAlternatives(false);
                      } else {
                        alert("Alternative exercise not found in database.");
                      }
                    }}
                  >
                    Use this exercise
                  </PrimaryAction>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
