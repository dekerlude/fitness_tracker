import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone, or not installable on this screen/browser/context, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 shadow transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Download className="w-3.5 h-3.5" />
        Install App
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-800 border border-zinc-700/80 hover:bg-zinc-700/60 text-zinc-300 font-bold text-xs px-3.5 py-1.5 shadow transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Install on iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2.5 mb-4 border-b border-zinc-850 pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">
                  PPL
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Install PPL Tracker</h3>
                  <p className="text-[10px] text-zinc-500">Run offline as a high-density standalone app</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 mt-0.5 shrink-0">1</div>
                  <p>Tap the <span className="font-bold text-white">Share</span> button in Safari's bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 mt-0.5 shrink-0">2</div>
                  <p>Scroll down the menu and tap <span className="font-bold text-white">Add to Home Screen</span>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-zinc-850 hover:bg-zinc-800 py-2.5 text-xs font-bold text-white transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
