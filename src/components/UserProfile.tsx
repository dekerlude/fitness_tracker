import React, { useState } from 'react';
import { UserProfile, EquipmentType, WorkoutLog, BodyLog } from '../types';
import { User, Dumbbell, Flame, Save, Download, Trash2, Database, ShieldAlert, Sparkles } from 'lucide-react';

interface UserProfileProps {
  profile: UserProfile;
  logs: WorkoutLog[];
  bodyLogs: BodyLog[];
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onClearHistory: () => void;
  onInjectSampleData: () => void;
}

export default function UserProfileComponent({
  profile,
  logs,
  bodyLogs,
  onUpdateProfile,
  onClearHistory,
  onInjectSampleData
}: UserProfileProps) {
  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);
  const [goal, setGoal] = useState(profile.goal);
  const [split, setSplit] = useState(profile.split);
  const [equipment, setEquipment] = useState<EquipmentType>(profile.equipment);
  const [proteinPerKg, setProteinPerKg] = useState(profile.proteinPerKg);
  const [customCalories, setCustomCalories] = useState<number>(profile.customCaloriesGoal || 2100);

  // --- COMPUTE RECOMENDED CALORIES & PROTEIN ---
  // Simple Harris-Benedict BMR with exercise multiplier for active training
  const estimatedBMR = 10 * weight + 6.25 * height - 5 * 25 + 5; // Assumes average age 25 for aesthetic split
  const dailyCaloriesTarget = Math.round(estimatedBMR * 1.55 - 200); // TDEE active - small deficit for lean physique
  const finalCaloriesTarget = profile.customCaloriesGoal || dailyCaloriesTarget;
  
  const dailyProteinTarget = Math.round(weight * proteinPerKg);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      weight,
      height,
      goal,
      split,
      equipment,
      proteinPerKg,
      customCaloriesGoal: customCalories
    });
    alert('User Profile updated successfully!');
  };

  // --- EXPORT HISTORY AS CSV ---
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("No workout logs in history to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Session,Exercise,Set,Weight (kg),Reps,RPE,Completed\n";

    logs.forEach(log => {
      log.exercises.forEach(exLog => {
        exLog.sets.forEach((set, setIdx) => {
          const row = [
            log.date,
            `"${log.workoutDayName}"`,
            `"${exLog.exerciseName}"`,
            setIdx + 1,
            set.weight,
            set.reps,
            set.rpe,
            set.completed ? "Y" : "N"
          ].join(",");
          csvContent += row + "\n";
        });
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ppl_tracker_workout_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Bio inputs form */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          <User className="w-4.5 h-4.5 text-blue-500" />
          Aesthetic Metrics & Settings
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 64)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Height (cm)</label>
              <input
                type="number"
                min={100}
                max={250}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 170)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Physique Target Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              placeholder="e.g. lean muscle / aesthetic physique"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Frequency / Split Ratio</label>
            <input
              type="text"
              value={split}
              onChange={(e) => setSplit(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              placeholder="e.g. PPL, 6 days/week"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Equipment Tier</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="gym">Full Commercial Gym</option>
                <option value="dumbbell">Dumbbells Only</option>
                <option value="bodyweight">Bodyweight / No Equipment</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Protein Scale Ratio (g/kg)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1.6"
                  max="2.2"
                  step="0.1"
                  value={proteinPerKg}
                  onChange={(e) => setProteinPerKg(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-xs font-bold text-zinc-300 w-12 text-right">{proteinPerKg}g/kg</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Manual Calorie Overrule (kcal/day)</label>
            <input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(parseInt(e.target.value) || 2000)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Profile Configurations
          </button>
        </form>
      </div>

      {/* Target Calculations Dashboard */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
          <Flame className="w-4.5 h-4.5 text-orange-500" />
          Lean Aesthetic Nutrition targets
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/60 text-center">
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Aesthetic Calories Deficit</span>
            <span className="text-lg font-black text-orange-500 mt-1 block">{finalCaloriesTarget} kcal</span>
            <span className="text-[9px] text-zinc-500 mt-0.5 block leading-relaxed">Assists muscle gain while trimming bodyfat percent.</span>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/60 text-center">
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Protein Threshold Target</span>
            <span className="text-lg font-black text-blue-400 mt-1 block">{dailyProteinTarget} grams</span>
            <span className="text-[9px] text-zinc-500 mt-0.5 block leading-relaxed">Preserves lean muscle structure and speeds recovery.</span>
          </div>
        </div>

        <div className="p-3.5 bg-blue-950/20 rounded-xl border border-blue-900/30 text-xs text-zinc-400 leading-relaxed space-y-1.5">
          <div className="font-bold text-blue-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            The V-Taper Ratio Formula:
          </div>
          To achieve a classic athletic frame, prioritize upper back vertical pulls (Pullups/Lat Pulldowns) and side shoulder isolation (Lateral raises) while eating in a slight caloric deficit. This visual balance widens the upper shelf, yielding a tight, narrow waist illusion without needing extreme caloric starvation.
        </div>
      </div>

      {/* History and data management options */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Database className="w-4.5 h-4.5 text-zinc-400" />
          Data & History Utilities
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportCSV}
            className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4.5 h-4.5 text-zinc-400" />
            Export History (.CSV)
          </button>

          <button
            onClick={onInjectSampleData}
            className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
            Inject 4-Week Sample Logs
          </button>
        </div>

        <div className="border-t border-zinc-800/60 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-rose-500 text-xs">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span className="font-semibold">Caution: Dangerous Actions</span>
          </div>

          <button
            onClick={() => {
              if (confirm("Are you absolutely sure you want to delete ALL workout history and weight logs? This is irreversible.")) {
                onClearHistory();
              }
            }}
            className="w-full sm:w-auto bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-950/50 py-2 px-4 rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Local Storage Database
          </button>
        </div>
      </div>
    </div>
  );
}
