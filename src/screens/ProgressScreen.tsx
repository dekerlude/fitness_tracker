import React, { useMemo, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Check, Trash2, X } from 'lucide-react';
import { api } from '../data/api';
import { KEYS, getStorage, MonthlyTotals, StreakState, deleteWorkoutRecord } from '../data/storage';

export const ProgressScreen: React.FC = () => {
  const [history, setHistory] = useState(() => api.getWorkoutHistory());
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalWorkouts = history.length;
  
  const streakObj = getStorage<StreakState>(KEYS.STREAK, { currentStreak: 0, lastWorkoutDate: null });
  const currentStreak = streakObj.currentStreak;

  const monthlyTotals = getStorage<MonthlyTotals>(KEYS.MONTHLY_TOTALS, {});
  const historyMonths = Object.keys(monthlyTotals).sort().reverse().map(key => {
     const [year, month] = key.split('-');
     const date = new Date(parseInt(year), parseInt(month) - 1, 1);
     const name = date.toLocaleString('default', { month: 'long', year: 'numeric' });
     return { name, count: monthlyTotals[key] };
  });

  const handleDeleteConfirm = () => {
    if (!sessionToDelete || isDeleting) return;
    setIsDeleting(true);
    
    const success = deleteWorkoutRecord(sessionToDelete);
    if (success) {
      // Re-fetch history to update UI immediately
      setHistory(api.getWorkoutHistory());
    } else {
      alert("Workout record no longer exists or could not be deleted.");
    }
    
    setSessionToDelete(null);
    setIsDeleting(false);
  };

  if (history.length === 0 && historyMonths.length === 0) {
    return (
      <div className="flex flex-col min-h-[70vh] px-6 items-center justify-center text-center">
        <h1 className="text-3xl font-display uppercase text-white mb-6">No History Yet</h1>
        <p className="text-secondary mb-12">Complete your first workout to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      <h1 className="text-3xl font-bold font-display uppercase text-white tracking-tight mb-8">
        Your Progress
      </h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard className="p-5 flex flex-col justify-between">
          <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-3">Workout Sessions</h3>
          <span className="text-4xl font-bold font-display uppercase leading-none text-white">{totalWorkouts}</span>
        </GlassCard>
        
        <GlassCard className="p-5 flex flex-col justify-between">
          <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-3">Streak</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold font-display uppercase leading-none text-white">{currentStreak}</span>
            <span className="text-sm font-medium text-secondary mb-1">Days</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mb-6">
        <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-6">Monthly History</h3>
        {historyMonths.length === 0 ? (
          <p className="text-secondary text-sm">No past months completed yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {historyMonths.map((m, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <span className="font-semibold text-white">{m.name}</span>
                <div className="flex items-center gap-2">
                   <span className="text-xl font-bold font-display text-white">{m.count}</span>
                   <span className="text-xs text-secondary font-bold uppercase tracking-widest">Days</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-6">Recent Sessions</h3>
        {history.length === 0 ? (
          <p className="text-secondary text-sm">No sessions recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {[...history].reverse().slice(0, 10).map((session, i) => {
              const d = new Date(session.date);
              const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const workoutDay = api.getWorkoutByDay(session.workoutId);
              const workoutName = workoutDay ? workoutDay.name : `Day ${session.workoutId}`;
              
              return (
                <div key={session.id || i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{workoutName}</span>
                    <span className="text-xs text-secondary">{dateStr} • {Math.round(session.duration / 60)} min</span>
                  </div>
                  <button 
                    onClick={() => setSessionToDelete(session.id)}
                    className="p-2 text-secondary hover:text-red-400 transition-colors bg-white/5 rounded-lg"
                    aria-label="Delete workout"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSessionToDelete(null)} />
          <GlassCard className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-200 border-white/10">
            <h3 className="text-xl font-display font-bold uppercase text-white mb-2">Delete workout?</h3>
            <p className="text-secondary text-sm mb-8">This will remove this workout record permanently. Exercise progress will remain intact.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setSessionToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs border border-white/10 text-white hover:bg-white/5 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
