import React from 'react';

interface PrimaryActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'gradient' | 'outline' | 'glass';
}

export const PrimaryAction: React.FC<PrimaryActionProps> = ({ 
  children, 
  className = '', 
  variant = 'gradient',
  ...props 
}) => {
  const baseStyles = "w-full py-5 px-6 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all active:scale-[0.98]";
  
  let variantStyles = "";
  if (variant === 'gradient') {
    variantStyles = "bg-gradient-to-r from-accent to-blue-400 text-white glow-active border-none";
  } else if (variant === 'outline') {
    variantStyles = "bg-transparent border-2 border-accent text-accent glow-subtle";
  } else if (variant === 'glass') {
    variantStyles = "bg-card border-glass text-white";
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
