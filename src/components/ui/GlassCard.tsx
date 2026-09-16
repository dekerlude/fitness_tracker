import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div className={`bg-card rounded-3xl border-glass p-6 ${glow ? 'glow-subtle' : ''} ${className}`}>
      {children}
    </div>
  );
};
