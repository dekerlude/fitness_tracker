import React from 'react';

export const AppBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-background bg-radial-gradient text-primary overflow-hidden pb-safe">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      
      {/* Decorative Toji Background (Global) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-30">
        <img 
          src="/assets/toji-outline.png" 
          alt=""
          className="w-[140%] max-w-none sm:w-[80%] md:w-auto md:h-[110%] object-contain opacity-80 animate-pulse mix-blend-screen"
          style={{ 
             filter: 'drop-shadow(0 0 8px #3b82f6) drop-shadow(0 0 24px rgba(59,130,246,0.8))' 
          }}
        />
      </div>
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};
