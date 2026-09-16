import React, { useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { PrimaryAction } from '../components/ui/PrimaryAction';
import { api } from '../data/api';
import { KEYS, getStorage, getLocalMonthKey, ActivityRecord, StreakState } from '../data/storage';

interface HomeScreenProps {
  onStartWorkout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartWorkout }) => {
  const currentDay = api.getCurrentCalendarWorkoutDay();
  const todayWorkout = api.getWorkoutByDay(currentDay);
  const profile = api.getUserProfile();
  const userName = profile?.name || 'Athlete';
  
  // Calculate approximate duration based on sets
  const exercises = api.getExercisesForWorkout(currentDay);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const estimatedDuration = Math.round(totalSets * 2); // ~2 min per set (including rest)

  const currentMonthKey = getLocalMonthKey(Date.now());
  const activity = getStorage<ActivityRecord>(KEYS.ACTIVITY, {});
  const activeDaysThisMonth = activity[currentMonthKey] || [];
  
  const streakObj = getStorage<StreakState>(KEYS.STREAK, { currentStreak: 0, lastWorkoutDate: null });
  const currentStreak = streakObj.currentStreak;

  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = String(now.getDate()).padStart(2, '0');
    
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, '0');
      const isWorkoutDay = activeDaysThisMonth.includes(dayStr);
      const isToday = dayStr === todayStr;
      const isFuture = i > now.getDate();
      cells.push({
        type: 'day',
        key: `day-${i}`,
        day: i,
        isWorkoutDay,
        isToday,
        isFuture
      });
    }
    return cells;
  }, [activeDaysThisMonth]);

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 relative overflow-hidden">
      


      {/* Main Content Container (z-10 to stay above background) */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
      <header className="mb-10">
        <h2 className="text-secondary text-lg font-medium mb-1">
          Welcome, {userName}.
        </h2>
        <h1 className="text-3xl font-bold font-display uppercase text-white tracking-tight">
          Ready to train?
        </h1>
      </header>

      {/* Primary Action Card */}
      <GlassCard glow className="mb-8 p-8 relative overflow-hidden group border-white/10">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <h3 className="text-secondary font-semibold text-xs tracking-widest uppercase mb-2">Today's Workout</h3>
        
        {(!todayWorkout || todayWorkout.exerciseIds.length === 0) ? (
          <>
            <h2 className="text-3xl font-bold font-display uppercase tracking-tight text-white mb-2 leading-tight">
              REST DAY
            </h2>
            <p className="text-sm text-secondary font-medium mb-8">
              Recovery is part of the plan.
            </p>
            <PrimaryAction onClick={() => {}} variant="glass">
              View Weekly Plan
            </PrimaryAction>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold font-display uppercase tracking-tight text-white mb-2 leading-tight">
              {todayWorkout.shortName}
            </h2>
            <p className="text-sm text-secondary font-medium mb-6">
              {todayWorkout.name}
            </p>
            
            <div className="flex items-center gap-4 text-secondary mb-8 font-medium">
              <span>{todayWorkout.exerciseIds.length} Exercises</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>~{estimatedDuration} min</span>
            </div>
            
            <PrimaryAction onClick={onStartWorkout}>
              Start Workout
            </PrimaryAction>
          </>
        )}
      </GlassCard>

      {/* Secondary Progress Area */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard className="p-5 flex flex-col justify-between">
          <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-3">Active Days</h3>
          <div className="flex items-end gap-2 mt-auto">
            <span className="text-3xl font-bold font-display uppercase leading-none text-white">{activeDaysThisMonth.length}</span>
            <span className="text-sm font-medium text-secondary pb-0.5">This Month</span>
          </div>
        </GlassCard>
        
        <GlassCard className="p-5 flex flex-col justify-between">
          <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-3">Current Streak</h3>
          <div className="flex items-end gap-2 mt-auto">
            <span className="text-3xl font-bold font-display uppercase leading-none text-white">{currentStreak}</span>
            <span className="text-sm font-medium text-secondary pb-0.5">Days</span>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Calendar */}
      <GlassCard className="p-6">
        <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-6">Monthly Activity</h3>
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
             <div key={i} className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{day}</div>
          ))}
          {calendarDays.map((cell: any) => {
             if (cell.type === 'empty') {
               return <div key={cell.key} className="h-6" />;
             }
             
             let dotClass = "w-1.5 h-1.5 rounded-full mx-auto ";
             if (cell.isWorkoutDay) {
               dotClass += "bg-accent glow-subtle";
             } else if (cell.isFuture) {
               dotClass += "bg-white/5";
             } else {
               dotClass += "bg-white/20";
             }

             return (
               <div key={cell.key} className={`h-6 flex items-center justify-center ${cell.isToday ? 'bg-white/5 rounded-full' : ''}`}>
                 <div className={dotClass} />
               </div>
             );
          })}
        </div>
      </GlassCard>
      </div>
    </div>
  );
};
