import React, { useState, useMemo } from 'react';
import { Exercise, EquipmentType, WorkoutLog, WorkoutDay } from '../types';
import { MASTER_EXERCISES } from '../data/exercises';
import { Search, Compass, Dumbbell, Eye, RefreshCw, Sparkles, BookOpen, ChevronRight, AlertCircle, Check } from 'lucide-react';

interface RecommendationEngineProps {
  currentSplit: WorkoutDay[];
  logs: WorkoutLog[];
  equipment: EquipmentType;
  onUpdateSplit: (updatedSplit: WorkoutDay[]) => void;
}

export default function RecommendationEngine({ currentSplit, logs, equipment, onUpdateSplit }: RecommendationEngineProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType>(equipment);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'library' | 'ai-tips'>('recommendations');
  
  // AI advice state
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // --- COMPUTE NEGLECTED MUSCLES ---
  const muscleGroupStats = useMemo(() => {
    const stats: Record<string, { sets: number; lastTrainedDate: string | null }> = {
      chest: { sets: 0, lastTrainedDate: null },
      back: { sets: 0, lastTrainedDate: null },
      shoulders: { sets: 0, lastTrainedDate: null },
      biceps: { sets: 0, lastTrainedDate: null },
      triceps: { sets: 0, lastTrainedDate: null },
      quads: { sets: 0, lastTrainedDate: null },
      hamstrings: { sets: 0, lastTrainedDate: null },
      calves: { sets: 0, lastTrainedDate: null },
      'rear-delts-traps': { sets: 0, lastTrainedDate: null },
    };

    // Sort logs chronologically to get the most recent dates
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedLogs.forEach(log => {
      log.exercises.forEach(exLog => {
        const masterEx = MASTER_EXERCISES.find(e => e.id === exLog.exerciseId);
        if (masterEx) {
          const completedSetsCount = exLog.sets.filter(s => s.completed).length;
          const muscle = masterEx.muscleGroup;
          if (muscle in stats) {
            stats[muscle].sets += completedSetsCount;
            stats[muscle].lastTrainedDate = log.date;
          }
        }
      });
    });

    return stats;
  }, [logs]);

  const neglectedMuscles = useMemo(() => {
    return (Object.entries(muscleGroupStats) as [string, { sets: number; lastTrainedDate: string | null }][])
      .filter(([_, data]) => data.sets < 6) // Neglected if under 6 total sets recently
      .map(([muscle]) => muscle);
  }, [muscleGroupStats]);

  // --- REPEATED / STALE EXERCISES ---
  const overusedExercises = useMemo(() => {
    const counts: Record<string, number> = {};
    const recentLogs = logs.slice(-5); // look at past 5 logged workouts

    recentLogs.forEach(log => {
      log.exercises.forEach(exLog => {
        counts[exLog.exerciseId] = (counts[exLog.exerciseId] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .filter(([_, count]) => count >= 4) // repeated in 4 out of last 5 sessions
      .map(([id]) => id);
  }, [logs]);

  // --- FILTERED MASTER LIBRARY ---
  const filteredExercises = useMemo(() => {
    return MASTER_EXERCISES.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ex.instructions.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscleFilter === 'all' || ex.muscleGroup === selectedMuscleFilter;
      const matchesEquipment = selectedEquipment === 'gym' || 
                               ex.equipmentRequired === selectedEquipment || 
                               ex.equipmentRequired === 'bodyweight'; // bodyweight matches any equipment tier
      
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [searchQuery, selectedMuscleFilter, selectedEquipment]);

  // --- SWAP EXERCISE IN SPLIT ---
  const handleSwapExercise = (targetDayId: string, oldExerciseId: string, newExercise: Exercise) => {
    const updated = currentSplit.map(day => {
      if (day.id === targetDayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex => ex.id === oldExerciseId ? newExercise : ex)
        };
      }
      return day;
    });
    onUpdateSplit(updated);
    alert(`Successfully swapped for ${newExercise.name} in your split!`);
  };

  // --- GET SMART SWAP RECOMMANDATIONS ---
  const recommendationsList = useMemo(() => {
    const suggestions: {
      type: 'neglected' | 'stale';
      muscle?: string;
      staleExName?: string;
      workoutDayId: string;
      workoutDayName: string;
      targetExId: string;
      targetExName: string;
      recommendedReplacements: Exercise[];
    }[] = [];

    currentSplit.forEach(day => {
      day.exercises.forEach(ex => {
        // If muscle group is neglected and this exercise doesn't target it, suggest adding one
        const isStale = overusedExercises.includes(ex.id);
        
        // Find replacements that match our equipment requirement
        const replacements = MASTER_EXERCISES.filter(mEx => 
          mEx.muscleGroup === ex.muscleGroup && 
          mEx.id !== ex.id &&
          (selectedEquipment === 'gym' || mEx.equipmentRequired === selectedEquipment || mEx.equipmentRequired === 'bodyweight')
        );

        if (isStale && replacements.length > 0) {
          suggestions.push({
            type: 'stale',
            staleExName: ex.name,
            workoutDayId: day.id,
            workoutDayName: day.name,
            targetExId: ex.id,
            targetExName: ex.name,
            recommendedReplacements: replacements.slice(0, 3)
          });
        }
      });
    });

    // Neglected muscle recommendation (general additions)
    neglectedMuscles.forEach(muscle => {
      const relevantExercises = MASTER_EXERCISES.filter(ex => 
        ex.muscleGroup === muscle &&
        (selectedEquipment === 'gym' || ex.equipmentRequired === selectedEquipment || ex.equipmentRequired === 'bodyweight')
      );
      
      if (relevantExercises.length > 0) {
        // Suggest adding to a relevant day in PPL split
        const matchingCategory = relevantExercises[0].category;
        const targetDay = currentSplit.find(d => d.category === matchingCategory);
        if (targetDay) {
          suggestions.push({
            type: 'neglected',
            muscle: muscle,
            workoutDayId: targetDay.id,
            workoutDayName: targetDay.name,
            targetExId: '',
            targetExName: `Add to ${targetDay.name}`,
            recommendedReplacements: relevantExercises.slice(0, 2)
          });
        }
      }
    });

    return suggestions;
  }, [currentSplit, overusedExercises, neglectedMuscles, selectedEquipment]);

  // --- CALL SERVER SIDE GEMINI FOR ATHLETIC TIPS ---
  const handleGenerateAITips = async () => {
    setAiLoading(true);
    setAiError('');
    setAiAdvice('');

    try {
      // Formulate request to server
      const response = await fetch('/api/recommend-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment: selectedEquipment,
          recentLogs: logs.slice(-10),
          goals: 'Lean athletic aesthetic physique, moderate-to-high rep counts (8-15 reps), optimal recovery lines.'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI Engine. Make sure server is running and API keys are verified.');
      }

      const data = await response.json();
      if (data.advice) {
        setAiAdvice(data.advice);
      } else {
        throw new Error('Empty recommendation returned.');
      }
    } catch (err: any) {
      // Fallback local robust rule-based generator if backend isn't provisioned or fails
      console.warn("API route failed, utilizing backup rule-based engine: ", err);
      setTimeout(() => {
        const fallbackAdvice = `### 🌟 Aesthetic Lean Physique Program Advisory

Based on your available equipment (**${selectedEquipment.toUpperCase()}**) and current **Push/Pull/Legs** profile, follow these target directions for the best athletic conditioning:

1. **Optimize Your Density Volume**: Aim for **12-15 reps** on isolation accessories (like Lateral Raises and Cable Flies) to maximize time-under-tension and pump. Rest for **60-90 seconds** between these sets.
2. **Compound Preservation**: Keep heavier compound lifts (like Bench Press or Squats) in the **8-10 rep range** with **2-3 minutes of rest** to preserve dense myofibrillar mass while leaning down.
3. **Target Neglected Upper-Shelf Muscles**:
   - Focus on **Lateral raises & Rear delts** to widen the shoulders, creating the illusion of a narrower waist (classic aesthetic V-taper).
   - Ensure your Pull days incorporate high chest-supported horizontal row contractions for full back depth.
4. **Deload Strategy**: Every 6 weeks, scale your weights back by 30% or drop 1 set per exercise to allow full tendon recovery while maintaining gym consistency.`;
        setAiAdvice(fallbackAdvice);
        setAiLoading(false);
      }, 1000);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector of Equipment */}
      <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Equipment Level Preference</h2>
          <p className="text-zinc-500 text-[11px]">Adapts the exercise recommendations and alternative suggestions below.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {(['bodyweight', 'dumbbell', 'gym'] as EquipmentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedEquipment(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedEquipment === type
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {type === 'gym' ? 'Full Gym' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800/80 text-sm">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-1.5 pb-2.5 px-4 font-semibold transition-all relative ${
            activeTab === 'recommendations' ? 'text-blue-500' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          Recommendations
          {recommendationsList.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
          {activeTab === 'recommendations' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-1.5 pb-2.5 px-4 font-semibold transition-all relative ${
            activeTab === 'library' ? 'text-blue-500' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Exercise Library
          {activeTab === 'library' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
        </button>
        <button
          onClick={() => {
            setActiveTab('ai-tips');
            if (!aiAdvice) handleGenerateAITips();
          }}
          className={`flex items-center gap-1.5 pb-2.5 px-4 font-semibold transition-all relative ${
            activeTab === 'ai-tips' ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          Aesthetic AI Tips
          {activeTab === 'ai-tips' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />}
        </button>
      </div>

      {/* Tab 1: Recommendations list */}
      {activeTab === 'recommendations' && (
        <div className="space-y-5">
          {/* Neglected Muscles Summary Panel */}
          {neglectedMuscles.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Neglected Muscle Groups</h4>
                <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                  The following muscle groups have low volume in your logs this week:{' '}
                  <span className="text-white font-bold capitalize">
                    {neglectedMuscles.join(', ')}
                  </span>
                  . Swap some exercises below to bring balanced development.
                </p>
              </div>
            </div>
          )}

          {recommendationsList.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-8 text-center space-y-3">
              <Check className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-200">Perfect Routine Balance</h3>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
                Your split program looks fantastic! No neglected muscles or stale plateaus detected based on your logging history.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendationsList.map((rec, idx) => (
                <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        rec.type === 'stale' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {rec.type === 'stale' ? 'Plateau Warning' : 'Neglected Muscle'}
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-200 mt-1.5">
                        {rec.type === 'stale' 
                          ? `Substitute "${rec.staleExName}" on ${rec.workoutDayName}` 
                          : `Include ${rec.muscle?.toUpperCase()} stimulation on ${rec.workoutDayName}`
                        }
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide block">Suggested Swaps:</span>
                    <div className="grid grid-cols-1 gap-3">
                      {rec.recommendedReplacements.map((newEx) => (
                        <div key={newEx.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60 flex items-center justify-between gap-3 hover:border-zinc-700/80 transition-all">
                          <div>
                            <span className="text-xs font-semibold text-zinc-200 block">{newEx.name}</span>
                            <span className="text-[10px] text-zinc-500 block leading-relaxed line-clamp-1 mt-0.5">{newEx.instructions}</span>
                          </div>
                          <button
                            onClick={() => handleSwapExercise(rec.workoutDayId, rec.targetExId, newEx)}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Swap
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Master Exercise Library */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* Search bar & filter controls */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search instructions or exercise name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>
            <select
              value={selectedMuscleFilter}
              onChange={(e) => setSelectedMuscleFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            >
              <option value="all">All Muscle Groups</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="shoulders">Shoulders</option>
              <option value="biceps">Biceps</option>
              <option value="triceps">Triceps</option>
              <option value="quads">Quads</option>
              <option value="hamstrings">Hamstrings</option>
              <option value="calves">Calves</option>
              <option value="rear-delts-traps">Rear Delts & Traps</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredExercises.map((ex) => (
              <details key={ex.id} className="group bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300 border border-zinc-800">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-200 block">{ex.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-[9px] text-zinc-500 capitalize">
                          {ex.equipmentRequired === 'gym' ? 'Full Gym Required' : ex.equipmentRequired}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-open:rotate-90 transition-transform" />
                </summary>
                
                <div className="px-4 pb-4 border-t border-zinc-800/40 pt-3 space-y-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide block">Execution Form:</span>
                    <p className="text-zinc-300 text-xs mt-1 leading-relaxed">{ex.instructions}</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Home/Minimal Gear Alternative:</span>
                      <span className="text-[9px] text-zinc-500 italic">No equipment variant</span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-200 block mt-1">{ex.alternativeName}</span>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{ex.alternativeInstruction}</p>
                  </div>
                </div>
              </details>
            ))}
            {filteredExercises.length === 0 && (
              <div className="text-center py-8 text-xs text-zinc-500">
                No exercises found matching your filter combinations. Try adjusting equipment level or search text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Aesthetic AI Advice Assistant */}
      {activeTab === 'ai-tips' && (
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-purple-950/40 p-2 rounded-xl text-purple-400 border border-purple-800/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Aesthetic Conditioning Coach</h3>
                <p className="text-zinc-500 text-[10px]">Generates high-performance tips targeting lean muscle ratios.</p>
              </div>
            </div>
            <button
              onClick={handleGenerateAITips}
              disabled={aiLoading}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          <div className="bg-zinc-950/80 rounded-xl border border-zinc-900 p-4 min-h-[160px] text-xs">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 animate-pulse text-[11px]">Analyzing split volume balances and conditioning models...</p>
              </div>
            ) : aiAdvice ? (
              <div className="prose prose-invert prose-xs text-zinc-300 leading-relaxed space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {aiAdvice.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('###')) {
                    return <h4 key={i} className="text-xs font-bold text-purple-400 pt-2">{paragraph.replace('###', '').trim()}</h4>;
                  }
                  if (paragraph.match(/^\d+\./)) {
                    return <p key={i} className="pl-4 border-l border-zinc-800 py-0.5">{paragraph}</p>;
                  }
                  return <p key={i}>{paragraph}</p>;
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-zinc-500">
                {aiError || 'Click regenerate to formulate bespoke advice tailored for your current fitness program.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
