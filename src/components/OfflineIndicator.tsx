import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-4 md:right-auto md:w-80 z-50 flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-400 font-semibold shadow-2xl backdrop-blur-md animate-bounce">
      <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
      <div className="flex-1">
        <p className="font-bold text-[11px] text-amber-300">Offline Mode Active</p>
        <p className="text-[9px] text-amber-400/80 font-normal mt-0.5">Logs will batch to local storage and sync seamlessly.</p>
      </div>
    </div>
  );
};
