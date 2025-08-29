'use client';

import React from 'react';

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
  className?: string;
}

// 旋轉載入動畫
export function SpinnerLoading({ size = 'md', color = 'primary', className = '' }: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-muted-foreground',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
    muted: 'border-muted-foreground',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        animate-spin rounded-full border-2 border-transparent
        ${colorClasses[color]} border-t-transparent
        ${className}
      `}
      role="status"
      aria-label="載入中"
    >
      <span className="sr-only">載入中...</span>
    </div>
  );
}

// 脈衝載入動畫
export function PulseLoading({ size = 'md', color = 'primary', className = '' }: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-muted',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    muted: 'bg-muted-foreground',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        animate-pulse rounded-full
        ${colorClasses[color]}
        ${className}
      `}
      role="status"
      aria-label="載入中"
    >
      <span className="sr-only">載入中...</span>
    </div>
  );
}

// 跳動載入動畫
export function BouncingDots({ size = 'md', color = 'primary', className = '' }: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-6 w-6',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-muted-foreground',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`} role="status" aria-label="載入中">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full animate-bounce
        `}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full animate-bounce
        `}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full animate-bounce
        `}
        style={{ animationDelay: '300ms' }}
      />
      <span className="sr-only">載入中...</span>
    </div>
  );
}

// 波浪載入動畫
export function WaveLoading({ size = 'md', color = 'primary', className = '' }: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-muted-foreground',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
    muted: 'border-muted-foreground',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`} role="status" aria-label="載入中">
      <div
        className={`
          absolute inset-0 rounded-full border-2 border-transparent
          ${colorClasses[color]} animate-ping
        `}
      />
      <div
        className={`
          absolute inset-2 rounded-full border-2 border-transparent
          ${colorClasses[color]} animate-ping
        `}
        style={{ animationDelay: '0.5s' }}
      />
      <span className="sr-only">載入中...</span>
    </div>
  );
}

// 進度條載入動畫
interface ProgressLoadingProps extends LoadingAnimationProps {
  progress?: number;
  showPercentage?: boolean;
  indeterminate?: boolean;
}

export function ProgressLoading({ 
  size = 'md', 
  color = 'primary', 
  progress = 0,
  showPercentage = false,
  indeterminate = false,
  className = '' 
}: ProgressLoadingProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-muted-foreground',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-label="載入進度">
      <div className={`w-full ${heightClasses[size]} bg-muted rounded-full overflow-hidden`}>
        <div
          className={`
            ${heightClasses[size]} 
            ${colorClasses[color]} 
            rounded-full transition-all duration-300 ease-out
            ${indeterminate ? 'animate-pulse' : ''}
          `}
          style={{
            width: indeterminate ? '100%' : `${Math.min(100, Math.max(0, progress))}%`,
            transform: indeterminate ? 'translateX(-100%)' : 'none',
            animation: indeterminate ? 'progress-indeterminate 2s infinite linear' : 'none',
          }}
        />
      </div>
      {showPercentage && !indeterminate && (
        <div className="mt-1 text-xs text-muted-foreground text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

// 骨架屏載入動畫
interface SkeletonLoadingProps {
  lines?: number;
  className?: string;
  avatar?: boolean;
  button?: boolean;
}

export function SkeletonLoading({ 
  lines = 3, 
  className = '', 
  avatar = false, 
  button = false 
}: SkeletonLoadingProps) {
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="載入中">
      <div className="space-y-3">
        {avatar && (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        )}
        
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-muted rounded ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
        
        {button && (
          <div className="h-10 bg-muted rounded w-24" />
        )}
      </div>
      <span className="sr-only">載入中...</span>
    </div>
  );
}

// 卡片骨架屏
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <SkeletonLoading lines={2} avatar />
      </div>
      <div className="card-content">
        <SkeletonLoading lines={3} />
      </div>
      <div className="card-footer">
        <SkeletonLoading lines={1} button />
      </div>
    </div>
  );
}

// 表格骨架屏
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="載入表格">
      <div className="space-y-3">
        {/* 表頭 */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={`header-${index}`} className="h-4 bg-muted rounded" />
          ))}
        </div>
        
        {/* 表格行 */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`} 
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`} 
                className={`h-4 bg-muted rounded ${
                  colIndex === 0 ? 'w-3/4' : colIndex === columns - 1 ? 'w-1/2' : 'w-full'
                }`} 
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">載入表格資料...</span>
    </div>
  );
}

// CSS 動畫樣式（需要添加到全域 CSS）
const animationStyles = `
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
`;

// 導出動畫樣式以便在全域 CSS 中使用
export { animationStyles };