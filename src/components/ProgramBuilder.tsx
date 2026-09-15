import React, { useState } from 'react';
import { WorkoutDay, Exercise, EquipmentType } from '../types';
import { MASTER_EXERCISES } from '../data/exercises';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Check, Clipboard, RefreshCw } from 'lucide-react';

interface ProgramBuilderProps {
  currentSplit: WorkoutDay[];
  onUpdateSplit: (updatedSplit: WorkoutDay[]) => void;
}

export default function ProgramBuilder({ currentSplit, onUpdateSplit }: ProgramBuilderProps) {
  const [selectedDayId, setSelectedDayId] = useState<string>(currentSplit[0]?.id || 'push_a');
  
  // Custom exercise form state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<Exercise['muscleGroup']>('chest');
  const [customSets, setCustomSets] = useState(3);
  const [customRepMin, setCustomRepMin] = useState(10);
  const [customRepMax, setCustomRepMax] = useState(12);

  const selectedDay = currentSplit.find(day => day.id === selectedDayId);

  // Reorder exercises
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (!selectedDay) return;
    const list = [...selectedDay.exercises];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[swapIndex];
    list[swapIndex] = temp;

    const updated = currentSplit.map(day => {
      if (day.id === selectedDayId) {
        return { ...day, exercises: list };
      }
      return day;
    });
    onUpdateSplit(updated);
  };

  // Remove exercise from split
  const handleRemoveExercise = (exerciseId: string) => {
    if (!selectedDay) return;
    const list = selectedDay.exercises.filter(ex => ex.id !== exerciseId);
    
    const updated = currentSplit.map(day => {
      if (day.id === selectedDayId) {
        return { ...day, exercises: list };
      }
      return day;
    });
    onUpdateSplit(updated);
  };

  // Add exercise from library or custom
  const handleAddExerciseFromLibrary = (libEx: Exercise) => {
    if (!selectedDay) return;
    
    // Check if already in split
    if (selectedDay.exercises.some(ex => ex.id === libEx.id)) {
      alert(`${libEx.name} is already added to this workout.`);
      return;
    }

    const updated = currentSplit.map(day => {
      if (day.id === selectedDayId) {
        return {
          ...day,
          exercises: [...day.exercises, libEx]
        };
      }
      return day;
    });
    onUpdateSplit(updated);
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !customName.trim()) return;

    const newEx: Exercise = {
      id: `custom_${Date.now()}`,
      name: customName,
      muscleGroup: customMuscle,
      category: selectedDay.category,
      defaultSets: customSets,
      repsRange: { min: customRepMin, max: customRepMax },
      instructions: 'Custom created exercise.',
      alternativeName: 'None',
      alternativeInstruction: 'None',
      equipmentRequired: 'gym'
    };

    const updated = currentSplit.map(day => {
      if (day.id === selectedDayId) {
        return {
          ...day,
          exercises: [...day.exercises, newEx]
        };
      }
      return day;
    });

    onUpdateSplit(updated);
    setCustomName('');
    setShowAddCustom(false);
  };

  // Quick reset to default templates
  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset ALL 6 workout split variations to default? This will overwrite your custom modifications.")) {
      localStorage.removeItem('ppl_workout_split');
      window.location.reload();
    }
  };

  const dayCategoryColor = (category: string) => {
    switch (category) {
      case 'Push': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Pull': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Legs': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper select split day menu */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Configure Session:</span>
          <button
            onClick={handleResetToDefault}
            className="text-[10px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 font-semibold border border-zinc-800 px-2 py-1 rounded-lg hover:border-rose-950 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Defaults
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {currentSplit.map((day) => {
            const isActive = day.id === selectedDayId;
            return (
              <button
                key={day.id}
                onClick={() => {
                  setSelectedDayId(day.id);
                  setShowAddCustom(false);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                    : 'bg-zinc-950 border-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {day.name}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="space-y-5">
          {/* Day details and list of exercises */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  {selectedDay.name} Program
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${dayCategoryColor(selectedDay.category)}`}>
                    {selectedDay.category} Day
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Customize default set rules and exercise hierarchy order.</p>
              </div>
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom
              </button>
            </div>

            {/* Form for custom exercise */}
            {showAddCustom && (
              <form onSubmit={handleCreateCustomExercise} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-4 transition-all">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs font-bold text-blue-400">Add New Custom Exercise</span>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="text-zinc-500 hover:text-zinc-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Exercise Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weighted Chin-ups"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Muscle Target</label>
                      <select
                        value={customMuscle}
                        onChange={(e) => setCustomMuscle(e.target.value as Exercise['muscleGroup'])}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                      >
                        <option value="chest">Chest</option>
                        <option value="shoulders">Shoulders</option>
                        <option value="back">Back</option>
                        <option value="biceps">Biceps</option>
                        <option value="triceps">Triceps</option>
                        <option value="quads">Quads</option>
                        <option value="hamstrings">Hamstrings</option>
                        <option value="calves">Calves</option>
                        <option value="rear-delts-traps">Rear Delts & Traps</option>
                        <option value="core">Abs & Core</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Sets Count</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={customSets}
                        onChange={(e) => setCustomSets(parseInt(e.target.value) || 3)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Reps Range Min</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={customRepMin}
                        onChange={(e) => setCustomRepMin(parseInt(e.target.value) || 8)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Reps Range Max</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={customRepMax}
                        onChange={(e) => setCustomRepMax(parseInt(e.target.value) || 12)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-xl text-xs transition-all shadow"
                >
                  Confirm and Insert
                </button>
              </form>
            )}

            {/* List of current split exercises */}
            <div className="space-y-3">
              {selectedDay.exercises.map((ex, idx) => (
                <div key={ex.id} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Index or drag reorder mock handles */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleMoveExercise(idx, 'up')}
                        disabled={idx === 0}
                        className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-all"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveExercise(idx, 'down')}
                        disabled={idx === selectedDay.exercises.length - 1}
                        className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-all"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">{ex.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide bg-zinc-900 border border-zinc-800 px-1 rounded">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {ex.defaultSets} sets &times; {ex.repsRange.min}-{ex.repsRange.max} reps
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveExercise(ex.id)}
                    className="text-zinc-600 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-950 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {selectedDay.exercises.length === 0 && (
                <div className="text-center py-8 border border-dashed border-zinc-800/60 rounded-xl text-zinc-500 text-xs">
                  No exercises in this workout session yet. Click libraries below or Add Custom to start.
                </div>
              )}
            </div>
          </div>

          {/* Quick Select Panel to load preloaded catalog exercises targeting this Category */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Available Exercise Catalog ({selectedDay.category})</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Quickly append standard exercises targeting the correct day type to your program split.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {MASTER_EXERCISES.filter(ex => ex.category === selectedDay.category).map((libEx) => {
                const isInSplit = selectedDay.exercises.some(e => e.id === libEx.id);
                return (
                  <div key={libEx.id} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/40 flex justify-between items-center gap-3">
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 block">{libEx.name}</span>
                      <span className="text-[9px] text-zinc-500 capitalize">{libEx.muscleGroup} &bull; {libEx.equipmentRequired === 'gym' ? 'Full Gym' : libEx.equipmentRequired}</span>
                    </div>
                    <button
                      onClick={() => handleAddExerciseFromLibrary(libEx)}
                      disabled={isInSplit}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        isInSplit
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow'
                      }`}
                    >
                      {isInSplit ? 'Added' : 'Add to Split'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
