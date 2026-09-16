import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`bg-gradient-to-r from-accent to-blue-400 text-white font-semibold py-4 px-8 rounded-full glow-active transition-all active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
