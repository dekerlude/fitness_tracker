import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`bg-[#121212] rounded-[24px] border border-[#222222] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
