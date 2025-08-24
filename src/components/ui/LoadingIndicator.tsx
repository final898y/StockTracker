'use client';

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'inline' | 'overlay' | 'page';
  className?: string;
}

export function LoadingIndicator({ 
  message = '載入中...', 
  size = 'md',
  variant = 'inline',
  className = '' 
}: LoadingIndicatorProps) {
  const baseClasses = 'flex items-center justify-center space-x-3';
  
  const variantClasses = {
    inline: 'py-4',
    overlay: 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50',
    page: 'min-h-[200px] py-12',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </span>
      )}
    </div>
  );
}