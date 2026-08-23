'use client';

import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  const baseClasses =
    'bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl transition-all duration-200';
  const hoverClasses = hoverEffect
    ? 'hover:border-slate-700 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};
