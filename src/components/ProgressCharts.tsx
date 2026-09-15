import React, { useState, useMemo } from 'react';
import { WorkoutLog, BodyLog, Exercise } from '../types';
import { MASTER_EXERCISES } from '../data/exercises';
import { TrendingUp, Award, Calendar, BarChart2 } from 'lucide-react';

interface ProgressChartsProps {
  logs: WorkoutLog[];
  bodyLogs: BodyLog[];
  exercises: Exercise[];
}

export default function ProgressCharts({ logs, bodyLogs, exercises }: ProgressChartsProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || 'flat_bench_press'
  );
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  // --- SORTED BODY LOGS & MOVING AVERAGE ---
  const sortedBodyLogs = useMemo(() => {
    return [...bodyLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bodyLogs]);

  const bodyWeightData = useMemo(() => {
    if (sortedBodyLogs.length === 0) return [];
    
    return sortedBodyLogs.map((log, index) => {
      // Calculate 7-day moving average (using past logs up to 7 entries)
      const subset = sortedBodyLogs.slice(Math.max(0, index - 6), index + 1);
      const avg = subset.reduce((acc, curr) => acc + curr.weight, 0) / subset.length;
      return {
        date: log.date,
        weight: log.weight,
        avg7Day: parseFloat(avg.toFixed(1)),
        raw: log
      };
    });
  }, [sortedBodyLogs]);

  // --- PROGRESSIVE OVERLOAD FOR SELECTED EXERCISE ---
  const exerciseHistory = useMemo(() => {
    const data: { date: string; maxWeight: number; volume: number; est1RM: number }[] = [];
    
    // Sort logs chronologically
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedLogs.forEach(log => {
      const exLog = log.exercises.find(e => e.exerciseId === selectedExerciseId);
      if (exLog && exLog.sets.length > 0) {
        const completedSets = exLog.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          let maxWeight = 0;
          let totalVolume = 0;
          let best1RM = 0;
          
          completedSets.forEach(set => {
            if (set.weight > maxWeight) maxWeight = set.weight;
            totalVolume += set.weight * set.reps;
            // Epley formula for 1RM estimate
            const est1RM = set.weight * (1 + set.reps / 30);
            if (est1RM > best1RM) best1RM = est1RM;
          });
          
          data.push({
            date: log.date,
            maxWeight,
            volume: totalVolume,
            est1RM: Math.round(best1RM)
          });
        }
      }
    });
    
    return data;
  }, [logs, selectedExerciseId]);

  // --- WEEKLY VOLUME BY MUSCLE GROUP ---
  const weeklyMuscleVolume = useMemo(() => {
    // Look at workouts in the last 7 days to calculate sets completed
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentLogs = logs.filter(log => new Date(log.date) >= oneWeekAgo);
    
    const volumeMap: Record<string, number> = {
      chest: 0,
      back: 0,
      shoulders: 0,
      biceps: 0,
      triceps: 0,
      quads: 0,
      hamstrings: 0,
      calves: 0,
      'rear-delts-traps': 0,
    };
    
    recentLogs.forEach(log => {
      log.exercises.forEach(exLog => {
        const masterEx = MASTER_EXERCISES.find(e => e.id === exLog.exerciseId);
        if (masterEx) {
          const completedSetsCount = exLog.sets.filter(s => s.completed).length;
          const muscle = masterEx.muscleGroup;
          if (muscle in volumeMap) {
            volumeMap[muscle] += completedSetsCount;
          } else {
            // Group other categories nicely
            if (muscle === 'core') {
              // optional core tracking
            }
          }
        }
      });
    });
    
    return Object.entries(volumeMap).map(([muscle, sets]) => ({
      muscle: muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('-', ' '),
      sets,
      targetMin: 10,
      targetMax: 16
    }));
  }, [logs]);

  // --- SVG PLOTTING HELPER ---
  const renderLineChart = (
    data: any[],
    yKey: string,
    secondaryYKey: string | null,
    title: string,
    yLabelUnit: string
  ) => {
    if (data.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-6 text-center">
          <TrendingUp className="w-8 h-8 text-zinc-600 mb-2" />
          <p className="text-zinc-400 text-sm font-medium">Insufficient Data points</p>
          <p className="text-zinc-500 text-xs mt-1">Log at least 2 sessions to visualize trends.</p>
        </div>
      );
    }

    const width = 500;
    const height = 220;
    const padding = 40;
    
    // Find min and max
    const yValues = data.flatMap(d => [d[yKey], secondaryYKey ? d[secondaryYKey] : d[yKey]].filter(v => v !== undefined));
    let yMax = Math.max(...yValues) * 1.02;
    let yMin = Math.min(...yValues) * 0.98;
    
    if (yMax === yMin) {
      yMax += 10;
      yMin = Math.max(0, yMin - 10);
    }

    const xScale = (index: number) => padding + (index / (data.length - 1)) * (width - padding * 2);
    const yScale = (val: number) => height - padding - ((val - yMin) / (yMax - yMin)) * (height - padding * 2);

    // Build path strings
    let primaryPath = '';
    let secondaryPath = '';
    
    data.forEach((d, i) => {
      const x = xScale(i);
      const y1 = yScale(d[yKey]);
      if (i === 0) {
        primaryPath = `M ${x} ${y1}`;
      } else {
        primaryPath += ` L ${x} ${y1}`;
      }

      if (secondaryYKey && d[secondaryYKey] !== undefined) {
        const y2 = yScale(d[secondaryYKey]);
        if (i === 0) {
          secondaryPath = `M ${x} ${y2}`;
        } else {
          secondaryPath += ` L ${x} ${y2}`;
        }
      }
    });

    const formatShortDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yVal = yMin + ratio * (yMax - yMin);
            const y = yScale(yVal);
            return (
              <g key={i} className="opacity-40">
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#27272a" strokeDasharray="3 3" strokeWidth={1} />
                <text x={padding - 8} y={y + 4} fill="#a1a1aa" fontSize={9} textAnchor="end">
                  {Math.round(yVal)}
                </text>
              </g>
            );
          })}

          {/* Date Axis labels (first, middle, last) */}
          {data.length > 0 && (
            <g className="text-zinc-500" fontSize={10}>
              <text x={xScale(0)} y={height - padding + 16} textAnchor="start">
                {formatShortDate(data[0].date)}
              </text>
              {data.length > 2 && (
                <text x={xScale(Math.floor(data.length / 2))} y={height - padding + 16} textAnchor="middle">
                  {formatShortDate(data[Math.floor(data.length / 2)].date)}
                </text>
              )}
              <text x={xScale(data.length - 1)} y={height - padding + 16} textAnchor="end">
                {formatShortDate(data[data.length - 1].date)}
              </text>
            </g>
          )}

          {/* Primary Trend Line */}
          <path d={primaryPath} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* Secondary Trend Line (7-Day Average or volume) */}
          {secondaryYKey && (
            <path d={secondaryPath} fill="none" stroke="#e11d48" strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Interactive touch targets */}
          {data.map((d, i) => {
            const x = xScale(i);
            const y1 = yScale(d[yKey]);
            return (
              <g key={i} className="group">
                <circle
                  cx={x}
                  cy={y1}
                  r={4}
                  fill="#2563eb"
                  className="transition-all duration-150 cursor-pointer group-hover:r-6"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredPoint({
                      x: x,
                      y: y1 - 10,
                      label: formatShortDate(d.date),
                      value: `${d[yKey]} ${yLabelUnit}`
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {secondaryYKey && d[secondaryYKey] !== undefined && (
                  <circle
                    cx={x}
                    cy={yScale(d[secondaryYKey])}
                    r={3.5}
                    fill="#e11d48"
                    onMouseEnter={() => {
                      setHoveredPoint({
                        x: x,
                        y: yScale(d[secondaryYKey]) - 10,
                        label: `${formatShortDate(d.date)} (7D Avg)`,
                        value: `${d[secondaryYKey]} ${yLabelUnit}`
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip inside SVG wrapper */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-zinc-950/95 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-xs shadow-xl flex flex-col z-10"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <span className="text-zinc-400 text-[10px]">{hoveredPoint.label}</span>
            <span className="font-bold text-white text-xs">{hoveredPoint.value}</span>
          </div>
        )}
      </div>
    );
  };

  // --- CALC PR BADGES ---
  const personalRecords = useMemo(() => {
    const prs: { exerciseName: string; weight: number; date: string }[] = [];
    
    exercises.forEach(ex => {
      let maxWeight = 0;
      let prDate = '';
      
      logs.forEach(log => {
        const exLog = log.exercises.find(el => el.exerciseId === ex.id);
        if (exLog) {
          exLog.sets.forEach(set => {
            if (set.completed && set.weight > maxWeight) {
              maxWeight = set.weight;
              prDate = log.date;
            }
          });
        }
      });
      
      if (maxWeight > 0) {
        prs.push({
          exerciseName: ex.name,
          weight: maxWeight,
          date: prDate
        });
      }
    });
    
    return prs.sort((a, b) => b.weight - a.weight).slice(0, 4);
  }, [logs, exercises]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1.5">
          <BarChart2 className="w-5 h-5 text-emerald-500" />
          Progress & Analytics
        </h2>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Monitor your strength development, weight trends, and muscle load balance to maintain consistent progressive overload.
        </p>
      </div>

      {/* Grid: Weight Trend and Muscle Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Body Weight Trend */}
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Body Weight Tracker</h3>
            <div className="flex items-center gap-4 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Logged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span> 7D Avg
              </span>
            </div>
          </div>
          {renderLineChart(bodyWeightData, 'weight', 'avg7Day', 'Weight Trend', 'kg')}
          {bodyWeightData.length > 0 && (
            <div className="text-center text-[11px] text-zinc-500">
              Showing logs over time. Keep logging weekly to track aesthetic conditioning.
            </div>
          )}
        </div>

        {/* Card 2: Weekly Sets Per Muscle Group */}
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Weekly Muscle Sets Volume</h3>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">Past 7 days</span>
          </div>

          <div className="space-y-3.5">
            {weeklyMuscleVolume.map((mv) => {
              const setsPercentage = Math.min(100, (mv.sets / 16) * 100);
              const targetMinPct = (10 / 16) * 100;
              const targetMaxPct = (16 / 16) * 100;
              
              // Color based on safe lean athletic ranges (10 - 16 sets)
              let barColor = 'bg-zinc-700';
              if (mv.sets >= 10 && mv.sets <= 16) {
                barColor = 'bg-emerald-500';
              } else if (mv.sets > 16) {
                barColor = 'bg-amber-500'; // high volume warning
              } else if (mv.sets > 0) {
                barColor = 'bg-blue-500'; // building up
              }

              return (
                <div key={mv.muscle} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{mv.muscle}</span>
                    <span className="text-zinc-400 font-bold">
                      {mv.sets} <span className="text-[10px] font-normal text-zinc-500">sets / week</span>
                    </span>
                  </div>
                  <div className="relative h-2.5 w-full bg-zinc-800/60 rounded-full overflow-hidden border border-zinc-800">
                    {/* Target zone highlighted box (10 to 16 sets) */}
                    <div
                      className="absolute top-0 bottom-0 bg-emerald-500/10 border-x border-emerald-500/20"
                      style={{ left: `${targetMinPct}%`, right: `${100 - targetMaxPct}%` }}
                    />
                    {/* Progress Bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${setsPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800/60 pt-3">
            🎯 <span className="text-emerald-400 font-medium">Aesthetic Goal Target</span> is <span className="text-zinc-300 font-medium">10 - 16 sets per week</span> per muscle group for lean athletic hypertrophy.
          </div>
        </div>
      </div>

      {/* Card 3: Progressive Overload & Exercise Trends */}
      <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Progressive Overload History
            </h3>
            <p className="text-[11px] text-zinc-500">Track maximum weight lifted per exercise across sessions.</p>
          </div>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600 max-w-xs"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {renderLineChart(exerciseHistory, 'maxWeight', 'est1RM', 'Overload Curve', 'kg')}

        {exerciseHistory.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800/60 text-center">
            <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/40">
              <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Max Weight</span>
              <span className="text-sm font-bold text-white">
                {Math.max(...exerciseHistory.map(d => d.maxWeight))} kg
              </span>
            </div>
            <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/40">
              <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Est. 1RM Best</span>
              <span className="text-sm font-bold text-amber-500">
                {Math.max(...exerciseHistory.map(d => d.est1RM))} kg
              </span>
            </div>
            <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/40">
              <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Total Workouts</span>
              <span className="text-sm font-bold text-blue-500">
                {exerciseHistory.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Personal Records Badges */}
      <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
          <Award className="w-4.5 h-4.5 text-yellow-500" />
          Personal Records (PRs)
        </h3>
        {personalRecords.length === 0 ? (
          <div className="text-center py-4 text-xs text-zinc-500">
            No PRs logged yet. Your maximum successful weight for each completed lift will show up here!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {personalRecords.map((pr) => (
              <div key={pr.exerciseName} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/50 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-zinc-300 truncate max-w-[130px]">
                    {pr.exerciseName}
                  </span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-right">
                  <span className="block text-xs font-bold text-amber-500">{pr.weight} kg</span>
                  <span className="block text-[8px] text-amber-600 font-semibold uppercase">PR HIT</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
