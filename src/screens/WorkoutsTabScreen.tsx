import React, { useState } from 'react';
import { api } from '../data/api';
import { PrimaryAction } from '../components/ui/PrimaryAction';
import { GlassCard } from '../components/ui/GlassCard';

interface WorkoutsTabScreenProps {
  onStartWorkout: () => void;
}

export const WorkoutsTabScreen: React.FC<WorkoutsTabScreenProps> = ({ onStartWorkout }) => {
  const currentCalendarDay = api.getCurrentCalendarWorkoutDay();
  const [selectedDay, setSelectedDay] = useState<number>(currentCalendarDay);
  
  const selectedWorkout = api.getWorkoutByDay(selectedDay);
  const exercises = api.getExercisesForWorkout(selectedDay);

  const daysOfWeek = [
    { label: 'Day 1 (Mon)', value: 1 },
    { label: 'Day 2 (Tue)', value: 2 },
    { label: 'Day 3 (Wed)', value: 3 },
    { label: 'Day 4 (Thu) - Rest', value: 4 },
    { label: 'Day 5 (Fri)', value: 5 },
    { label: 'Day 6 (Sat)', value: 6 },
    { label: 'Day 7 (Sun) - Rest', value: 7 },
  ];

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(parseInt(e.target.value));
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 pb-32">
      <header className="mb-6 flex flex-col gap-4">
        <h1 className="text-3xl font-bold font-display uppercase text-white tracking-tight leading-tight">
          Workouts
        </h1>
        
        <select 
          value={selectedDay} 
          onChange={handleDayChange}
          className="bg-card border border-white/10 rounded-xl p-3 text-white font-medium outline-none focus:border-accent/50"
        >
          {daysOfWeek.map(d => (
             <option key={d.value} value={d.value} className="bg-black text-white">{d.label}</option>
          ))}
        </select>
      </header>

      {(!selectedWorkout || selectedWorkout.exerciseIds.length === 0) ? (
        <div className="flex flex-col items-center justify-center text-center py-12 bg-card/30 rounded-2xl border border-white/5 mt-4">
          <h1 className="text-2xl font-bold font-display uppercase tracking-tight text-white mb-2">
            REST DAY
          </h1>
          <p className="text-sm text-secondary font-medium">
            Recovery is part of the plan.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 mt-2">
            <h3 className="text-secondary font-semibold text-xs tracking-widest uppercase mb-1">
              {selectedDay === currentCalendarDay ? "Today's Workout" : `Day ${selectedDay} Workout`}
            </h3>
            <h2 className="text-2xl font-bold font-display uppercase text-white tracking-tight leading-tight mb-1">
              {selectedWorkout.shortName}
            </h2>
            <p className="text-sm text-secondary font-medium">
              {selectedWorkout.name}
            </p>
          </div>
          
          {selectedDay === currentCalendarDay && (
            <PrimaryAction onClick={onStartWorkout} className="mb-8">
              Start Workout
            </PrimaryAction>
          )}

          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold font-display uppercase text-sm tracking-wider mb-2">
              {exercises.length} Exercises
            </h3>
            {exercises.map((ex, i) => (
              <GlassCard key={ex.id} className="p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-accent text-[10px] font-bold tracking-widest uppercase block mb-1">
                      {ex.primaryMuscle.replace('_', ' ')}
                    </span>
                    <h4 className="text-white font-bold">{ex.name}</h4>
                  </div>
                  <span className="text-secondary text-sm font-bold bg-white/5 px-2 py-1 rounded">
                    {i + 1}
                  </span>
                </div>
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-secondary tracking-widest uppercase">Sets</span>
                    <span className="text-white font-medium text-sm">{ex.sets}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-secondary tracking-widest uppercase">Reps</span>
                    <span className="text-white font-medium text-sm">{ex.repRange}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
