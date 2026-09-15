import React, { useState, useMemo } from 'react';
import { WorkoutDay, WorkoutLog, BodyLog } from '../types';
import { Play, Flame, BarChart, Scale, Calendar, AlertCircle, Sparkles, Check, ChevronRight } from 'lucide-react';

interface DashboardProps {
  currentSplit: WorkoutDay[];
  logs: WorkoutLog[];
  bodyLogs: BodyLog[];
  onStartWorkout: (workoutDay: WorkoutDay) => void;
  onQuickLogWeight: (weight: number, waist?: number, chest?: number, arms?: number) => void;
}

export default function Dashboard({ currentSplit, logs, bodyLogs, onStartWorkout, onQuickLogWeight }: DashboardProps) {
  const [quickWeight, setQuickWeight] = useState('');
  const [showWeightSuccess, setShowWeightSuccess] = useState(false);

  // --- AUTO ROTATE WORKOUT DAY ---
  const todayWorkout = useMemo(() => {
    if (logs.length === 0) return currentSplit[0]; // Start with Push A
    
    // Find the last completed workoutDayId
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastLogDayId = sortedLogs[0].workoutDayId;

    // Define standard PPL x2 sequence rotation
    const rotationSequence = ['push_a', 'pull_a', 'legs_a', 'push_b', 'pull_b', 'legs_b'];
    const lastIndex = rotationSequence.indexOf(lastLogDayId);

    if (lastIndex === -1) return currentSplit[0];

    const nextIndex = (lastIndex + 1) % rotationSequence.length;
    const nextDayId = rotationSequence[nextIndex];

    return currentSplit.find(d => d.id === nextDayId) || currentSplit[0];
  }, [logs, currentSplit]);

  // Handle manually overriding the today's selection
  const [overrideDayId, setOverrideDayId] = useState<string>('');
  const activeTodayWorkout = useMemo(() => {
    if (overrideDayId) {
      return currentSplit.find(d => d.id === overrideDayId) || todayWorkout;
    }
    return todayWorkout;
  }, [overrideDayId, todayWorkout, currentSplit]);

  // --- STATS CALCULATIONS ---
  const currentStreak = useMemo(() => {
    // Basic streak calculation: consecutive weeks with at least 3 workouts
    if (logs.length === 0) return 0;
    
    // Simply group logs by week or calculate consecutive logged days
    // For a simple high-fidelity app, let's look at the past 4 weeks and count how many had workouts
    // or calculate direct daily streak if they worked out in the last 3 days
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestDate = new Date(sorted[0].date);
    const today = new Date();
    
    const diffTime = Math.abs(today.getTime() - latestDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 4) {
      return 0; // Streak broken if no workout in past 4 days
    }
    
    // Count consecutive workout sessions within 3 days of each other
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].date);
      const d2 = new Date(sorted[i+1].date);
      const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 3) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [logs]);

  const weeklySetsVolume = useMemo(() => {
    // Count total completed sets across all logged workouts in the last 7 days
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentLogs = logs.filter(l => new Date(l.date) >= oneWeekAgo);
    let totalSets = 0;
    
    recentLogs.forEach(l => {
      l.exercises.forEach(ex => {
        totalSets += ex.sets.filter(s => s.completed).length;
      });
    });
    
    return totalSets;
  }, [logs]);

  const latestWeight = useMemo(() => {
    if (bodyLogs.length === 0) return '64.0';
    const sorted = [...bodyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].weight.toFixed(1);
  }, [bodyLogs]);

  // --- DELOAD AUTO-SUGGESTION ---
  // Suggest a deload if they have done 24+ workouts in general since their last deload log
  const needsDeload = useMemo(() => {
    if (logs.length === 0) return false;
    
    // Find the last deload log
    const lastDeloadIdx = logs.findIndex(l => l.deload);
    const workoutsSinceDeload = lastDeloadIdx === -1 ? logs.length : lastDeloadIdx;
    
    return workoutsSinceDeload >= 24; // ~4 weeks of 6-day split
  }, [logs]);

  // --- UPCOMING WEEK PREVIEW ---
  const upcomingWeekPreview = useMemo(() => {
    const preview: { name: string; dayName: string; isRest: boolean }[] = [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();

    // Map starting from today onwards for 6 days
    const rotationSequence = ['push_a', 'pull_a', 'legs_a', 'push_b', 'pull_b', 'legs_b'];
    
    // Find current index in PPL sequence
    const currentSeqId = activeTodayWorkout.id;
    let seqIndex = rotationSequence.indexOf(currentSeqId);
    if (seqIndex === -1) seqIndex = 0;

    for (let i = 0; i < 7; i++) {
      const idx = (todayIndex + i) % 7;
      const name = daysOfWeek[idx];
      
      // Let's make Sunday a default Rest Day in preview
      const isSunday = idx === 0;
      
      if (isSunday) {
        preview.push({
          name,
          dayName: 'Rest & Recover',
          isRest: true
        });
      } else {
        const splitDayId = rotationSequence[seqIndex % rotationSequence.length];
        const splitDay = currentSplit.find(d => d.id === splitDayId);
        preview.push({
          name,
          dayName: splitDay ? splitDay.name : 'Workout',
          isRest: false
        });
        seqIndex++;
      }
    }

    return preview;
  }, [activeTodayWorkout, currentSplit]);

  const handleQuickWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(quickWeight);
    if (!isNaN(num) && num > 30) {
      onQuickLogWeight(num);
      setQuickWeight('');
      setShowWeightSuccess(true);
      setTimeout(() => setShowWeightSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TODAY SCHEDULED WORKOUT BOX */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/40 via-zinc-900/50 to-zinc-900/60 border border-blue-900/30 rounded-3xl p-6 shadow-xl">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 blur-xl w-32 h-32 rounded-full bg-blue-500 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scheduled for Today</span>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {activeTodayWorkout.name}
              <span className="text-xs font-bold text-blue-400 bg-blue-950/50 border border-blue-900/40 px-2.5 py-0.5 rounded-full">
                {activeTodayWorkout.category} Day
              </span>
            </h2>
            
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              Focusing on: <span className="text-zinc-300 font-semibold capitalize">
                {activeTodayWorkout.exercises.map(ex => ex.name).slice(0, 3).join(', ')}...
              </span>
            </p>
          </div>

          <button
            onClick={() => onStartWorkout(activeTodayWorkout)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-blue-500/15 transition-all text-sm shrink-0 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Workout
          </button>
        </div>

        {/* Change today's exercise override dropdown */}
        <div className="border-t border-zinc-800/60 mt-5 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500">Not following rotation today? Select different session:</span>
          <select
            value={overrideDayId}
            onChange={(e) => setOverrideDayId(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
          >
            <option value="">Auto-Recommended ({todayWorkout.name})</option>
            {currentSplit.map(day => (
              <option key={day.id} value={day.id}>{day.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. THREE STATS CARDS GRID */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Log Streak</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white">{currentStreak}</span>
            <span className="text-[9px] text-zinc-500 font-medium">sessions</span>
          </div>
          <span className="text-[9px] text-orange-400 flex items-center gap-1 mt-1.5">
            <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
            Active Streak
          </span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">7D Set Volume</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white">{weeklySetsVolume}</span>
            <span className="text-[9px] text-zinc-500 font-medium">completed sets</span>
          </div>
          <span className="text-[9px] text-blue-400 flex items-center gap-1 mt-1.5">
            <BarChart className="w-3 h-3" />
            Targets: ~50-80
          </span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Latest Weight</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white">{latestWeight}</span>
            <span className="text-[9px] text-zinc-500 font-medium">kg</span>
          </div>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1.5">
            <Scale className="w-3 h-3" />
            Aesthetic target
          </span>
        </div>
      </div>

      {/* 3. RECOVERY & COGNITIVE ADVICE (DELOAD) */}
      {needsDeload && (
        <div className="bg-purple-950/20 border border-purple-900/30 rounded-2xl p-4.5 flex gap-3.5">
          <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wide">Deload Week Suggested</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              You have completed over 24 high-intensity workouts since your last deload window. To avoid nervous system plateaus and tendon fatigue, we suggest dropping your active lift weights by 30% for the next 6 sessions.
            </p>
          </div>
        </div>
      )}

      {/* 4. UPCOMING SCHEDULE PREVIEW AND REST CHECKLISTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Weekly Schedule Planner card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            Upcoming Week Schedule
          </h3>

          <div className="space-y-2.5">
            {upcomingWeekPreview.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                  idx === 0
                    ? 'bg-blue-950/20 border-blue-900/40 text-blue-200 font-bold'
                    : 'bg-zinc-950/40 border-zinc-900/60 text-zinc-400'
                }`}
              >
                <span>{item.name} {idx === 0 && <span className="text-[10px] text-blue-400 ml-1">(Today)</span>}</span>
                <span className={item.isRest ? 'text-zinc-500 italic' : 'text-zinc-300 font-medium'}>
                  {item.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Bodyweight logger on dashboard */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-500" />
            Log Body Weight Update
          </h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed">Enter your weight weekly. We use a 7-day average to smooth out metabolic water fluctuations.</p>

          <form onSubmit={handleQuickWeightSubmit} className="flex gap-2.5">
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 64.5"
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 flex-1"
            />
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 hover:border-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs transition-all"
            >
              Log Weight
            </button>
          </form>

          {showWeightSuccess && (
            <div className="text-[10px] text-emerald-400 font-medium bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg text-center animate-pulse">
              Weight logged successfully! Trends updated.
            </div>
          )}

          {/* Active Rest checklist when taking a pause */}
          <div className="border-t border-zinc-800/60 pt-4 space-y-2.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Active Rest Checklist:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1.5 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-900">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                10k daily steps
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-900">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                3L hydration water
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-900">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                8 hours sleep quality
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-900">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Towel stretching
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
