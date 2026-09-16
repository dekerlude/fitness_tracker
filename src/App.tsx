import React, { useState } from 'react';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WorkoutScreen } from './screens/WorkoutScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { WorkoutsTabScreen } from './screens/WorkoutsTabScreen';
import { BottomNavigation, TabType } from './components/ui/BottomNavigation';
import { AppBackground } from './components/ui/AppBackground';
import { processMonthRollover } from './data/storage';

export default function App() {
  React.useEffect(() => {
    processMonthRollover();
  }, []);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('lpb_user') !== null;
  });
  
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [workoutActive, setWorkoutActive] = useState(false);

  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  if (workoutActive) {
    return (
      <AppBackground>
        <WorkoutScreen onFinishWorkout={() => setWorkoutActive(false)} />
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <div className="relative z-10 pb-32">
        {currentTab === 'home' && <HomeScreen onStartWorkout={() => setWorkoutActive(true)} />}
        {currentTab === 'workout' && <WorkoutsTabScreen onStartWorkout={() => setWorkoutActive(true)} />}
        {currentTab === 'progress' && <ProgressScreen />}
        {currentTab === 'profile' && <ProfileScreen />}
      </div>
      
      <BottomNavigation currentTab={currentTab} onChange={setCurrentTab} />
    </AppBackground>
  );
}
