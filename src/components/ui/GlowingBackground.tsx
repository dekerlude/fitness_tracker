import React from 'react';

export const GlowingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-evenly opacity-80 z-0 overflow-hidden" style={{ perspective: '1000px' }}>
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="w-[120%] -ml-[10%] h-12 bg-blue-700/40 rounded-full blur-md"
          style={{ 
            boxShadow: '0 0 40px 10px rgba(79, 70, 229, 0.4), inset 0 10px 20px rgba(255,255,255,0.2)',
            transform: `rotateX(60deg) translateZ(${i * -20}px) translateY(${i * 10}px)` 
          }}
        />
      ))}
      {/* Floating Glowing Orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-400 rounded-full blur-[2px]"
           style={{ boxShadow: '0 0 50px 20px rgba(96, 165, 250, 0.6), inset 0 0 20px rgba(255,255,255,0.8)' }} />
    </div>
  );
};
