import React, { useState } from 'react';
import { AppBackground } from '../components/ui/AppBackground';
import { PrimaryAction } from '../components/ui/PrimaryAction';
import { ChevronRight } from 'lucide-react';
import { api } from '../data/api';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    height: '',
    sex: 'Male'
  });

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      if (profile.name.trim() === '') {
        alert('Please enter your name.');
        return;
      }
      api.saveUserProfile(profile);
      onComplete();
    }
  };

  return (
    <AppBackground>
      <div className="relative z-10 flex-1 flex flex-col px-8 py-12 min-h-screen">
        
        {/* Progress Indicator */}
        <div className="flex gap-2 w-full max-w-xs mx-auto mb-16 mt-8">
          <div className="h-1 flex-1 rounded-full bg-accent glow-subtle" />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step === 2 ? 'bg-accent glow-subtle' : 'bg-white/10'}`} />
        </div>

        <div className="flex-1 flex flex-col justify-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
          
          {step === 1 ? (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white uppercase leading-[1.15] mb-6 tracking-tight drop-shadow-lg">
                BUILD<br />YOUR<br />PHYSIQUE.
              </h1>
              <p className="text-secondary text-lg max-w-[280px] leading-relaxed mb-12">
                "Train smarter. Stay consistent."
              </p>
            </div>
          ) : (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-sm mx-auto">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase leading-[1.15] mb-8 tracking-tight drop-shadow-lg text-center">
                YOUR PROFILE
              </h1>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary font-bold uppercase tracking-widest ml-1">Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    placeholder="Your Name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-secondary font-bold uppercase tracking-widest ml-1">Age</label>
                    <input 
                      type="number" 
                      value={profile.age}
                      onChange={e => setProfile({...profile, age: e.target.value})}
                      placeholder="e.g. 25"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-secondary font-bold uppercase tracking-widest ml-1">Height</label>
                    <input 
                      type="text" 
                      value={profile.height}
                      onChange={e => setProfile({...profile, height: e.target.value})}
                      placeholder="e.g. 180cm"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary font-bold uppercase tracking-widest ml-1">Sex</label>
                  <select 
                    value={profile.sex}
                    onChange={e => setProfile({...profile, sex: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-accent/50 transition-colors appearance-none"
                  >
                    <option value="Male" className="bg-black text-white">Male</option>
                    <option value="Female" className="bg-black text-white">Female</option>
                    <option value="Other" className="bg-black text-white">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pb-8">
          <PrimaryAction onClick={handleNext} className="flex items-center justify-center gap-2">
            {step === 1 ? (
              <>NEXT <ChevronRight size={20} strokeWidth={3} /></>
            ) : (
              'START TRAINING'
            )}
          </PrimaryAction>
        </div>
      </div>
    </AppBackground>
  );
};
