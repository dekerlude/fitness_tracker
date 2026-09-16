import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { PrimaryAction } from '../components/ui/PrimaryAction';
import { ChevronRight, Edit2, Check } from 'lucide-react';
import { api } from '../data/api';
import { UserProfile } from '../types';

export const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Lean Builder',
    age: '',
    height: '',
    sex: 'Male'
  });
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = api.getUserProfile();
    if (saved) {
      setProfile(saved);
    }
  }, []);

  const handleSave = () => {
    if (profile.name.trim() === '') {
      alert('Name cannot be empty.');
      return;
    }
    api.saveUserProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display uppercase text-white tracking-tight">
          Profile
        </h1>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="text-accent hover:text-white transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-wider"
        >
          {isEditing ? <><Check size={16} /> Save</> : <><Edit2 size={16} /> Edit</>}
        </button>
      </div>
      
      <GlassCard className="mb-6 p-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-accent to-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold glow-subtle shrink-0 uppercase">
            {profile.name.substring(0, 2)}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold text-xl focus:outline-none focus:border-accent/50 mb-1"
                placeholder="Your Name"
              />
            ) : (
              <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
            )}
            <p className="text-accent text-sm font-medium tracking-wide">Lean Muscle Goal</p>
          </div>
        </div>
        
        {/* Profile Details Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 pt-6 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Age</span>
            {isEditing ? (
               <input 
                 type="number" 
                 value={profile.age}
                 onChange={e => setProfile({...profile, age: e.target.value})}
                 className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white font-medium text-sm focus:outline-none focus:border-accent/50"
                 placeholder="Age"
               />
            ) : (
              <span className="font-medium text-white">{profile.age || '—'}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Height</span>
            {isEditing ? (
               <input 
                 type="text" 
                 value={profile.height}
                 onChange={e => setProfile({...profile, height: e.target.value})}
                 className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white font-medium text-sm focus:outline-none focus:border-accent/50"
                 placeholder="Height"
               />
            ) : (
              <span className="font-medium text-white">{profile.height || '—'}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Sex</span>
            {isEditing ? (
               <select 
                 value={profile.sex}
                 onChange={e => setProfile({...profile, sex: e.target.value})}
                 className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white font-medium text-sm focus:outline-none focus:border-accent/50 appearance-none"
               >
                 <option value="Male" className="bg-black text-white">Male</option>
                 <option value="Female" className="bg-black text-white">Female</option>
                 <option value="Other" className="bg-black text-white">Other</option>
               </select>
            ) : (
              <span className="font-medium text-white">{profile.sex}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t border-white/5">
          <h3 className="text-secondary text-xs font-bold tracking-widest uppercase mb-1">Current Plan</h3>
          <p className="font-medium text-white text-lg">PPL, 6 Days / Week</p>
        </div>
      </GlassCard>

      <GlassCard className="p-2 mb-8">
        <button className="w-full flex justify-between items-center px-4 py-4 border-b border-white/5 group active:bg-white/5 transition-colors rounded-t-xl">
          <span className="font-medium text-white group-hover:text-accent transition-colors">Notifications</span>
          <ChevronRight size={20} className="text-secondary group-hover:text-accent transition-colors" />
        </button>
        <button className="w-full flex justify-between items-center px-4 py-4 border-b border-white/5 group active:bg-white/5 transition-colors">
          <span className="font-medium text-white group-hover:text-accent transition-colors">Units</span>
          <span className="text-secondary font-medium">kg</span>
        </button>
        <button className="w-full flex justify-between items-center px-4 py-4 group active:bg-white/5 transition-colors rounded-b-xl">
          <span className="font-medium text-white group-hover:text-accent transition-colors">Theme</span>
          <span className="text-secondary font-medium">System</span>
        </button>
      </GlassCard>

      <PrimaryAction variant="glass" onClick={() => {
          localStorage.removeItem('lpb_onboarding');
          localStorage.removeItem('lpb_user_profile');
          window.location.reload();
        }}>
        Reset Onboarding
      </PrimaryAction>
    </div>
  );
};
