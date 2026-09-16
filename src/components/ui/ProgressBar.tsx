import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return (
    <div className={`w-full bg-[#333333] h-1.5 rounded-full overflow-hidden ${className}`}>
      <div 
        className="bg-[#FFFFFF] h-full transition-all duration-300 ease-out rounded-full"
        style={{ width: `${clampedProgress * 100}%` }}
      />
    </div>
  );
};
