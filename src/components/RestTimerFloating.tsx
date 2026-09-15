import React, { useState, useEffect } from 'react';
import { Clock, X, Play } from 'lucide-react';

interface RestTimerFloatingProps {
  trigger: { duration: number; timestamp: number } | null;
}

export const RestTimerFloating = React.memo(function RestTimerFloating({ trigger }: RestTimerFloatingProps) {
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    if (trigger) {
      setTimerSeconds(trigger.duration);
      setTimerActive(true);
    }
  }, [trigger]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timerSeconds === 0) {
      setTimerActive(false);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSeconds]);

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-zinc-950 border border-zinc-800 shadow-2xl p-3.5 rounded-2xl flex items-center justify-between gap-4 z-40">
      <div className="flex items-center gap-2">
        <Clock className={`w-5 h-5 text-blue-500 ${timerActive ? 'animate-pulse' : ''}`} />
        <div>
          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Resting Timer:</span>
          <span className={`text-sm font-black tracking-wider ${timerSeconds <= 5 && timerActive ? 'text-rose-500 font-bold animate-ping' : 'text-white'}`}>
            {timerActive ? `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}` : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => startRestTimer(60)}
          className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded-lg hover:border-zinc-700 transition-all font-semibold"
        >
          60s
        </button>
        <button
          onClick={() => startRestTimer(90)}
          className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded-lg hover:border-zinc-700 transition-all font-semibold"
        >
          90s
        </button>
        <button
          onClick={() => startRestTimer(120)}
          className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded-lg hover:border-zinc-700 transition-all font-semibold"
        >
          2m
        </button>
        {timerActive ? (
          <button
            onClick={() => {
              setTimerActive(false);
              setTimerSeconds(0);
            }}
            className="bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 border border-rose-950/50 p-1.5 rounded-lg transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => startRestTimer(90)}
            className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-all shadow-md"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
