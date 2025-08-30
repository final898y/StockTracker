'use client';

import React from 'react';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';
import { useThemeToggle } from '@/contexts/theme-context';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'md', 
  showLabel = false,
  className = '' 
}: ThemeToggleProps) {
  const { 
    theme, 
    isLight, 
    isDark, 
    isSystem,
    setLightTheme, 
    setDarkTheme, 
    setSystemTheme,
    toggleTheme 
  } = useThemeToggle();

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // 簡單按鈕切換（循環：light -> dark -> system）
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]} 
          inline-flex items-center justify-center rounded-md
          bg-background border border-border hover:bg-muted
          transition-colors focus-ring
          ${className}
        `}
        title={`當前主題: ${theme === 'system' ? '跟隨系統' : theme === 'light' ? '淺色' : '深色'}`}
        aria-label="切換主題"
      >
        {theme === 'light' && <SunIcon className={iconSizes[size]} />}
        {theme === 'dark' && <MoonIcon className={iconSizes[size]} />}
        {theme === 'system' && <MonitorIcon className={iconSizes[size]} />}
        {showLabel && (
          <span className="ml-2 text-sm">
            {theme === 'system' ? '跟隨系統' : theme === 'light' ? '淺色' : '深色'}
          </span>
        )}
      </button>
    );
  }

  // 開關樣式
  if (variant === 'switch') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-foreground">
            深色模式
          </span>
        )}
        <button
          onClick={() => isDark ? setLightTheme() : setDarkTheme()}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus-ring
            ${isDark ? 'bg-primary' : 'bg-muted'}
          `}
          role="switch"
          aria-checked={isDark}
          aria-label="切換深色模式"
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white
              transition-transform
              ${isDark ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    );
  }

  // 下拉選單樣式
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-1 bg-background border border-border rounded-md p-1">
          <button
            onClick={setLightTheme}
            className={`
              ${sizeClasses[size]} rounded-sm transition-colors focus-ring
              ${isLight && theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            `}
            title="淺色主題"
            aria-label="設定為淺色主題"
          >
            <SunIcon className={iconSizes[size]} />
          </button>
          
          <button
            onClick={setDarkTheme}
            className={`
              ${sizeClasses[size]} rounded-sm transition-colors focus-ring
              ${isDark && theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            `}
            title="深色主題"
            aria-label="設定為深色主題"
          >
            <MoonIcon className={iconSizes[size]} />
          </button>
          
          <button
            onClick={setSystemTheme}
            className={`
              ${sizeClasses[size]} rounded-sm transition-colors focus-ring
              ${isSystem ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            `}
            title="跟隨系統主題"
            aria-label="設定為跟隨系統主題"
          >
            <MonitorIcon className={iconSizes[size]} />
          </button>
        </div>
        
        {showLabel && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            {theme === 'system' ? '跟隨系統' : theme === 'light' ? '淺色模式' : '深色模式'}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// 主題狀態指示器
export function ThemeIndicator({ className = '' }: { className?: string }) {
  const { theme, actualTheme } = useThemeToggle();

  return (
    <div className={`flex items-center space-x-2 text-xs text-muted-foreground ${className}`}>
      <div className={`w-2 h-2 rounded-full ${actualTheme === 'dark' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
      <span>
        {theme === 'system' ? `跟隨系統 (${actualTheme === 'dark' ? '深色' : '淺色'})` : 
         theme === 'light' ? '淺色模式' : '深色模式'}
      </span>
    </div>
  );
}