import React from 'react';
import { Home, Dumbbell, BarChart3, User } from 'lucide-react';

export type TabType = 'home' | 'workout' | 'progress' | 'profile';

interface BottomNavigationProps {
  currentTab: TabType;
  onChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'progress', icon: BarChart3, label: 'Progress' },
    { id: 'profile', icon: User, label: 'Profile' }
  ] as const;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-40">
      <div className="bg-card/90 backdrop-blur-md border border-white/5 rounded-full px-6 py-4 flex justify-between items-center shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id as TabType)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 ${
                isActive ? 'text-accent' : 'text-secondary hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-accent/20 rounded-full glow-subtle pointer-events-none" />
              )}
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
