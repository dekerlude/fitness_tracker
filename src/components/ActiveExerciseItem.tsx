import React from 'react';
import { Exercise, LogSet } from '../types';
import { HelpCircle, RefreshCw, Check, Award } from 'lucide-react';

interface ActiveExerciseItemProps {
  exIdx: number;
  exercise: Exercise;
  sets: LogSet[];
  advice: string | null;
  previousStats: string;
  onUpdateSet: (exIndex: number, setIndex: number, fields: Partial<LogSet>) => void;
  onToggleSetComplete: (exIndex: number, setIndex: number) => void;
  onAddSet: (exIndex: number) => void;
  onRemoveSet: (exIndex: number) => void;
  onSwapExercise: (exIndex: number) => void;
}

export const ActiveExerciseItem = React.memo(function ActiveExerciseItem({
  exIdx,
  exercise,
  sets,
  advice,
  previousStats,
  onUpdateSet,
  onToggleSetComplete,
  onAddSet,
  onRemoveSet,
  onSwapExercise,
}: ActiveExerciseItemProps) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4.5 space-y-4">
      {/* Exercise description row */}
      <div className="flex justify-between items-start border-b border-zinc-850 pb-3">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 block">{exercise.muscleGroup}</span>
          <h3 className="text-xs font-bold text-white mt-0.5">{exercise.name}</h3>
          <p className="text-[10px] text-zinc-500 font-medium mt-1">
            Goal: {exercise.defaultSets} sets &times; {exercise.repsRange.min}-{exercise.repsRange.max} reps
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => alert(`Instructions:\n\n${exercise.instructions}\n\nAlternative: ${exercise.alternativeName}`)}
            className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
            title="Form Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSwapExercise(exIdx)}
            className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Swap
          </button>
        </div>
      </div>

      {/* Previous session performance reference box */}
      <div className="text-[10px] text-zinc-500 bg-zinc-950/40 px-3 py-1.5 rounded-lg italic border border-zinc-900">
        {previousStats}
      </div>

      {/* Sets inputs list */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider text-center border-b border-zinc-850 pb-1.5">
          <span className="col-span-2 text-left">Set</span>
          <span className="col-span-3">Weight (kg)</span>
          <span className="col-span-3">Reps</span>
          <span className="col-span-2">RPE</span>
          <span className="col-span-2">Log</span>
        </div>

        {sets.map((set, setIdx) => (
          <div
            key={set.id}
            className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border transition-all ${
              set.completed
                ? 'bg-emerald-500/10 border-emerald-500/20 text-white'
                : 'bg-zinc-950/40 border-zinc-900'
            }`}
          >
            {/* Set index */}
            <span className="col-span-2 text-center font-bold text-xs text-zinc-400">
              {setIdx + 1}
            </span>

            {/* Weight input */}
            <div className="col-span-3 flex items-center bg-zinc-950 rounded-lg border border-zinc-850 px-1">
              <input
                type="number"
                value={set.weight}
                onChange={(e) => onUpdateSet(exIdx, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                disabled={set.completed}
                className="w-full text-center bg-transparent border-0 py-1.5 text-xs focus:ring-0 text-white focus:outline-none"
              />
            </div>

            {/* Reps input */}
            <div className="col-span-3 flex items-center bg-zinc-950 rounded-lg border border-zinc-850 px-1">
              <input
                type="number"
                value={set.reps}
                onChange={(e) => onUpdateSet(exIdx, setIdx, { reps: parseInt(e.target.value) || 0 })}
                disabled={set.completed}
                className="w-full text-center bg-transparent border-0 py-1.5 text-xs focus:ring-0 text-white focus:outline-none"
              />
            </div>

            {/* RPE input */}
            <select
              value={set.rpe}
              onChange={(e) => onUpdateSet(exIdx, setIdx, { rpe: parseInt(e.target.value) || 8 })}
              disabled={set.completed}
              className="col-span-2 text-center bg-zinc-950 rounded-lg border border-zinc-850 text-xs py-1.5 focus:outline-none text-zinc-300"
            >
              {[10, 9, 8, 7, 6, 5].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            {/* Completion tick */}
            <button
              onClick={() => onToggleSetComplete(exIdx, setIdx)}
              className={`col-span-2 mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                set.completed
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Overload Alert popup */}
      {advice && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold p-2.5 rounded-xl flex items-center gap-1.5 animate-pulse">
          <Award className="w-4 h-4 shrink-0 text-emerald-400" />
          {advice}
        </div>
      )}

      {/* Sets addition/deletion helpers */}
      <div className="flex gap-2.5 justify-end">
        <button
          onClick={() => onRemoveSet(exIdx)}
          disabled={sets.length <= 1}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition-all border border-zinc-850 px-2 py-1 rounded"
        >
          Delete Set
        </button>
        <button
          onClick={() => onAddSet(exIdx)}
          className="text-[10px] text-blue-400 hover:text-blue-300 border border-blue-500/20 px-2 py-1 rounded hover:bg-blue-600/5 transition-all"
        >
          Add Set
        </button>
      </div>
    </div>
  );
});
