import React, { useState, useEffect, lazy, Suspense } from 'react';
import { UserProfile, WorkoutDay, WorkoutLog, BodyLog, Exercise } from './types';
import { getInitialWorkoutSplit } from './data/exercises';
import Dashboard from './components/Dashboard';
import WorkoutActive from './components/WorkoutActive';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const ProgramBuilder = lazy(() => import('./components/ProgramBuilder'));
const RecommendationEngine = lazy(() => import('./components/RecommendationEngine'));
const ProgressCharts = lazy(() => import('./components/ProgressCharts'));
const UserProfileComponent = lazy(() => import('./components/UserProfile'));

import { LayoutDashboard, ClipboardList, Lightbulb, BarChart3, UserCog, Activity } from 'lucide-react';

export default function App() {
  // --- STATE DEFINITIONS ---
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'split' | 'recommender' | 'analytics' | 'profile'>('dashboard');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDay | null>(null);

  // Core Persisted States
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ppl_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fall through */ }
    }
    return {
      weight: 64,
      height: 170,
      goal: "lean muscle / athletic physique",
      split: "PPL, 6 days/week",
      equipment: "gym",
      proteinPerKg: 2.0,
      customCaloriesGoal: 2100
    };
  });

  const [currentSplit, setCurrentSplit] = useState<WorkoutDay[]>(() => {
    const saved = localStorage.getItem('ppl_workout_split');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fall through */ }
    }
    return getInitialWorkoutSplit();
  });

  const [logs, setLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('ppl_workout_history');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fall through */ }
    }
    return [];
  });

  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>(() => {
    const saved = localStorage.getItem('ppl_body_history');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fall through */ }
    }
    // Pre-populate with initial log matching user profile
    return [
      {
        id: 'init_log',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days ago
        weight: 64,
        waist: 76,
        chest: 94,
        arms: 32
      }
    ];
  });

  // --- SAVE TO LOCALSTORAGE ON UPDATES WITH DEBOUNCE ---
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('ppl_user_profile', JSON.stringify(profile));
    }, 500);
    return () => clearTimeout(handler);
  }, [profile]);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('ppl_workout_split', JSON.stringify(currentSplit));
    }, 500);
    return () => clearTimeout(handler);
  }, [currentSplit]);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('ppl_workout_history', JSON.stringify(logs));
    }, 500);
    return () => clearTimeout(handler);
  }, [logs]);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('ppl_body_history', JSON.stringify(bodyLogs));
    }, 500);
    return () => clearTimeout(handler);
  }, [bodyLogs]);

  // --- CORE CALLBACK WORKFLOWS ---
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    // Log weight to bodyLogs history if it changed
    const todayStr = new Date().toISOString().slice(0, 10);
    const hasLogToday = bodyLogs.some(bl => bl.date === todayStr);
    
    if (!hasLogToday) {
      setBodyLogs(prev => [
        ...prev,
        {
          id: `bl_${Date.now()}`,
          date: todayStr,
          weight: updated.weight
        }
      ]);
    } else {
      setBodyLogs(prev => prev.map(bl => bl.date === todayStr ? { ...bl, weight: updated.weight } : bl));
    }
  };

  const handleQuickLogWeight = (weight: number, waist?: number, chest?: number, arms?: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const existingIdx = bodyLogs.findIndex(bl => bl.date === todayStr);

    if (existingIdx !== -1) {
      const updated = [...bodyLogs];
      updated[existingIdx] = {
        ...updated[existingIdx],
        weight,
        ...(waist !== undefined && { waist }),
        ...(chest !== undefined && { chest }),
        ...(arms !== undefined && { arms }),
      };
      setBodyLogs(updated);
    } else {
      setBodyLogs(prev => [
        ...prev,
        {
          id: `bl_${Date.now()}`,
          date: todayStr,
          weight,
          waist,
          chest,
          arms
        }
      ]);
    }

    // Update profile weight in sync
    setProfile(prev => ({ ...prev, weight }));
  };

  const handleUpdateSplit = (updatedSplit: WorkoutDay[]) => {
    setCurrentSplit(updatedSplit);
  };

  const handleStartWorkout = (day: WorkoutDay) => {
    setActiveWorkout(day);
  };

  const handleSaveCompletedWorkout = (completedLog: WorkoutLog) => {
    setLogs(prev => [completedLog, ...prev]);
    setActiveWorkout(null);
    setCurrentTab('analytics');
    alert("Incredible work! Session completed, progressive overload trends recalculated.");
  };

  const handleClearDatabase = () => {
    setLogs([]);
    setBodyLogs([
      {
        id: 'init_log',
        date: new Date().toISOString().slice(0,10),
        weight: profile.weight
      }
    ]);
    alert("Local database reset successfully.");
  };

  // --- INJECT HIGH-FIDELITY SAMPLE DATA ---
  const handleInjectSampleData = () => {
    const daysAgoStr = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.toISOString().slice(0, 10);
    };

    // 4 Weeks of realistic weight logs
    const sampleBodyLogs: BodyLog[] = [
      { id: 'b1', date: daysAgoStr(28), weight: 64.5, waist: 77, chest: 94, arms: 32 },
      { id: 'b2', date: daysAgoStr(21), weight: 64.2, waist: 76.5, chest: 94.2, arms: 32.2 },
      { id: 'b3', date: daysAgoStr(14), weight: 64.0, waist: 76.0, chest: 94.5, arms: 32.5 },
      { id: 'b4', date: daysAgoStr(7), weight: 63.8, waist: 75.5, chest: 95.0, arms: 32.7 },
      { id: 'b5', date: daysAgoStr(0), weight: 63.6, waist: 75.0, chest: 95.2, arms: 33.0 },
    ];

    // Rotational history: Push A -> Pull A -> Legs A -> Push B -> Pull B -> Legs B
    const sampleWorkoutLogs: WorkoutLog[] = [
      // --- WEEK 1 ---
      {
        id: 'wl_1',
        workoutDayId: 'push_a',
        workoutDayName: 'Push A',
        date: daysAgoStr(26),
        durationMinutes: 52,
        deload: false,
        exercises: [
          {
            exerciseId: 'flat_bench_press',
            exerciseName: 'Flat Bench Press',
            sets: [
              { id: 's1', weight: 40, reps: 10, rpe: 8, completed: true },
              { id: 's2', weight: 40, reps: 10, rpe: 8, completed: true },
              { id: 's3', weight: 40, reps: 9, rpe: 9, completed: true },
            ]
          },
          {
            exerciseId: 'overhead_press',
            exerciseName: 'Overhead Press (OHP)',
            sets: [
              { id: 's4', weight: 25, reps: 10, rpe: 8, completed: true },
              { id: 's5', weight: 25, reps: 10, rpe: 9, completed: true },
            ]
          },
          {
            exerciseId: 'lateral_raises',
            exerciseName: 'Lateral Raises',
            sets: [
              { id: 's6', weight: 6, reps: 12, rpe: 8, completed: true },
              { id: 's7', weight: 6, reps: 12, rpe: 8, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_2',
        workoutDayId: 'pull_a',
        workoutDayName: 'Pull A',
        date: daysAgoStr(25),
        durationMinutes: 55,
        deload: false,
        exercises: [
          {
            exerciseId: 'deadlift',
            exerciseName: 'Deadlift',
            sets: [
              { id: 's8', weight: 60, reps: 8, rpe: 8, completed: true },
              { id: 's9', weight: 60, reps: 8, rpe: 9, completed: true },
            ]
          },
          {
            exerciseId: 'pull_ups',
            exerciseName: 'Pull-ups',
            sets: [
              { id: 's10', weight: 0, reps: 8, rpe: 8, completed: true },
              { id: 's11', weight: 0, reps: 8, rpe: 9, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_3',
        workoutDayId: 'legs_a',
        workoutDayName: 'Legs A',
        date: daysAgoStr(24),
        durationMinutes: 60,
        deload: false,
        exercises: [
          {
            exerciseId: 'squats',
            exerciseName: 'Barbell Back Squat',
            sets: [
              { id: 's12', weight: 50, reps: 10, rpe: 8, completed: true },
              { id: 's13', weight: 50, reps: 10, rpe: 8, completed: true },
            ]
          }
        ]
      },

      // --- WEEK 2 (Strength Increasing) ---
      {
        id: 'wl_4',
        workoutDayId: 'push_b',
        workoutDayName: 'Push B',
        date: daysAgoStr(19),
        durationMinutes: 48,
        deload: false,
        exercises: [
          {
            exerciseId: 'incline_barbell_press',
            exerciseName: 'Incline Barbell Press',
            sets: [
              { id: 's14', weight: 35, reps: 10, rpe: 8, completed: true },
              { id: 's15', weight: 35, reps: 10, rpe: 9, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_5',
        workoutDayId: 'pull_b',
        workoutDayName: 'Pull B',
        date: daysAgoStr(18),
        durationMinutes: 50,
        deload: false,
        exercises: [
          {
            exerciseId: 'lat_pulldown',
            exerciseName: 'Lat Pulldown',
            sets: [
              { id: 's16', weight: 35, reps: 12, rpe: 8, completed: true },
              { id: 's17', weight: 35, reps: 11, rpe: 9, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_6',
        workoutDayId: 'legs_b',
        workoutDayName: 'Legs B',
        date: daysAgoStr(17),
        durationMinutes: 52,
        deload: false,
        exercises: [
          {
            exerciseId: 'front_squat',
            exerciseName: 'Front Squat / Bulgarian Split Squat',
            sets: [
              { id: 's18', weight: 30, reps: 10, rpe: 8, completed: true },
              { id: 's19', weight: 30, reps: 10, rpe: 8, completed: true },
            ]
          }
        ]
      },

      // --- WEEK 3 (Flat Bench going up from 40 to 42.5 kg) ---
      {
        id: 'wl_7',
        workoutDayId: 'push_a',
        workoutDayName: 'Push A',
        date: daysAgoStr(12),
        durationMinutes: 54,
        deload: false,
        exercises: [
          {
            exerciseId: 'flat_bench_press',
            exerciseName: 'Flat Bench Press',
            sets: [
              { id: 's20', weight: 42.5, reps: 10, rpe: 8, completed: true },
              { id: 's21', weight: 42.5, reps: 10, rpe: 8, completed: true },
              { id: 's22', weight: 42.5, reps: 10, rpe: 9, completed: true },
            ]
          },
          {
            exerciseId: 'overhead_press',
            exerciseName: 'Overhead Press (OHP)',
            sets: [
              { id: 's23', weight: 27.5, reps: 10, rpe: 8, completed: true },
              { id: 's24', weight: 27.5, reps: 9, rpe: 9, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_8',
        workoutDayId: 'pull_a',
        workoutDayName: 'Pull A',
        date: daysAgoStr(11),
        durationMinutes: 51,
        deload: false,
        exercises: [
          {
            exerciseId: 'deadlift',
            exerciseName: 'Deadlift',
            sets: [
              { id: 's25', weight: 65, reps: 8, rpe: 8, completed: true },
              { id: 's26', weight: 65, reps: 8, rpe: 9, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_9',
        workoutDayId: 'legs_a',
        workoutDayName: 'Legs A',
        date: daysAgoStr(10),
        durationMinutes: 55,
        deload: false,
        exercises: [
          {
            exerciseId: 'squats',
            exerciseName: 'Barbell Back Squat',
            sets: [
              { id: 's27', weight: 52.5, reps: 10, rpe: 8, completed: true },
              { id: 's28', weight: 52.5, reps: 10, rpe: 9, completed: true },
            ]
          }
        ]
      },

      // --- WEEK 4 (Progressive Overload Peak) ---
      {
        id: 'wl_10',
        workoutDayId: 'push_a',
        workoutDayName: 'Push A',
        date: daysAgoStr(5),
        durationMinutes: 55,
        deload: false,
        exercises: [
          {
            exerciseId: 'flat_bench_press',
            exerciseName: 'Flat Bench Press',
            sets: [
              { id: 's29', weight: 45, reps: 10, rpe: 8, completed: true },
              { id: 's30', weight: 45, reps: 10, rpe: 8, completed: true },
              { id: 's31', weight: 45, reps: 10, rpe: 9, completed: true },
            ]
          },
          {
            exerciseId: 'overhead_press',
            exerciseName: 'Overhead Press (OHP)',
            sets: [
              { id: 's32', weight: 30, reps: 10, rpe: 8, completed: true },
              { id: 's33', weight: 30, reps: 10, rpe: 9, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_11',
        workoutDayId: 'pull_a',
        workoutDayName: 'Pull A',
        date: daysAgoStr(4),
        durationMinutes: 52,
        deload: false,
        exercises: [
          {
            exerciseId: 'deadlift',
            exerciseName: 'Deadlift',
            sets: [
              { id: 's34', weight: 70, reps: 8, rpe: 8, completed: true },
              { id: 's35', weight: 70, reps: 8, rpe: 9, completed: true },
            ]
          }
        ]
      },
      {
        id: 'wl_12',
        workoutDayId: 'legs_a',
        workoutDayName: 'Legs A',
        date: daysAgoStr(3),
        durationMinutes: 57,
        deload: false,
        exercises: [
          {
            exerciseId: 'squats',
            exerciseName: 'Barbell Back Squat',
            sets: [
              { id: 's36', weight: 55, reps: 10, rpe: 8, completed: true },
              { id: 's37', weight: 55, reps: 10, rpe: 9, completed: true },
            ]
          }
        ]
      }
    ];

    setBodyLogs(sampleBodyLogs);
    setLogs(sampleWorkoutLogs);
    // Sync current profile weight
    setProfile(prev => ({ ...prev, weight: 63.6 }));
    alert("Injected 12 workouts and 5 weight records. Head over to Progress Charts to see the progressive overload curves!");
  };

  // Compile all exercises across splits for ease of lookup
  const uniqueSplitExercises = React.useMemo(() => {
    const list: Exercise[] = [];
    currentSplit.forEach(day => {
      day.exercises.forEach(ex => {
        if (!list.some(e => e.id === ex.id)) {
          list.push(ex);
        }
      });
    });
    return list;
  }, [currentSplit]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none pb-24">
      {/* 1. Header Bar */}
      <header className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 z-30 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/10">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight uppercase">PPL Tracker</h1>
            <span className="text-[10px] text-zinc-500 font-bold block leading-none">Aesthetic Conditioning</span>
          </div>
        </div>

        {/* Workout active resume trigger */}
        {activeWorkout ? (
          <button
            onClick={() => {
              // active workout is running as overlay, do nothing or show message
              alert("You have an active workout in progress. Scroll down or focus to complete!");
            }}
            className="text-[10px] bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full animate-pulse font-bold"
          >
            ACTIVE SESSION RUNNING
          </button>
        ) : (
          <PWAInstallButton />
        )}
      </header>

      {/* 2. Main Tab Screen Render Engine */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5 space-y-6">
        {activeWorkout ? (
          <WorkoutActive
            workoutDay={activeWorkout}
            logs={logs}
            equipment={profile.equipment}
            onCancel={() => {
              if (confirm("Are you sure you want to cancel today's gym session? Your set logs won't be saved.")) {
                setActiveWorkout(null);
              }
            }}
            onSave={handleSaveCompletedWorkout}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                currentSplit={currentSplit}
                logs={logs}
                bodyLogs={bodyLogs}
                onStartWorkout={handleStartWorkout}
                onQuickLogWeight={handleQuickLogWeight}
              />
            )}
            {currentTab === 'split' && (
              <Suspense fallback={<div className="flex justify-center py-20 text-zinc-500 text-xs">Loading split builder...</div>}>
                <ProgramBuilder
                  currentSplit={currentSplit}
                  onUpdateSplit={handleUpdateSplit}
                />
              </Suspense>
            )}
            {currentTab === 'recommender' && (
              <Suspense fallback={<div className="flex justify-center py-20 text-zinc-500 text-xs">Loading Swaps & AI Advice...</div>}>
                <RecommendationEngine
                  currentSplit={currentSplit}
                  logs={logs}
                  equipment={profile.equipment}
                  onUpdateSplit={handleUpdateSplit}
                />
              </Suspense>
            )}
            {currentTab === 'analytics' && (
              <Suspense fallback={<div className="flex justify-center py-20 text-zinc-500 text-xs">Loading progress analytics...</div>}>
                <ProgressCharts
                  logs={logs}
                  bodyLogs={bodyLogs}
                  exercises={uniqueSplitExercises}
                />
              </Suspense>
            )}
            {currentTab === 'profile' && (
              <Suspense fallback={<div className="flex justify-center py-20 text-zinc-500 text-xs">Loading your profile...</div>}>
                <UserProfileComponent
                  profile={profile}
                  logs={logs}
                  bodyLogs={bodyLogs}
                  onUpdateProfile={handleUpdateProfile}
                  onClearHistory={handleClearDatabase}
                  onInjectSampleData={handleInjectSampleData}
                />
              </Suspense>
            )}
          </>
        )}
      </main>

      {/* 3. Bottom Mobile App-like Navigation Bar (only visible when workout is not active) */}
      {!activeWorkout && (
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-900/80 shadow-2xl z-40 max-w-lg mx-auto">
          <div className="grid grid-cols-5 h-20 px-2 items-center text-center">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center h-full transition-all gap-1 ${
                currentTab === 'dashboard' ? 'text-blue-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-wide">Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('split')}
              className={`flex flex-col items-center justify-center h-full transition-all gap-1 ${
                currentTab === 'split' ? 'text-blue-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-wide">Split Builder</span>
            </button>

            <button
              onClick={() => setCurrentTab('recommender')}
              className={`flex flex-col items-center justify-center h-full transition-all gap-1 ${
                currentTab === 'recommender' ? 'text-blue-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-wide">Swaps & AI</span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex flex-col items-center justify-center h-full transition-all gap-1 ${
                currentTab === 'analytics' ? 'text-blue-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-wide">Analytics</span>
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex flex-col items-center justify-center h-full transition-all gap-1 ${
                currentTab === 'profile' ? 'text-blue-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <UserCog className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-wide">Profile</span>
            </button>
          </div>
        </nav>
      )}
      <OfflineIndicator />
    </div>
  );
}
