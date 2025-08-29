'use client';

import React, { useState, useEffect } from 'react';

// 淡入淡出過渡
interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export function FadeTransition({ 
  children, 
  show, 
  duration = 'normal', 
  className = '' 
}: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  const handleTransitionEnd = () => {
    if (!show) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`
        transition-opacity ${durationClasses[duration]} ease-in-out
        ${show ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}

// 滑動過渡
interface SlideTransitionProps {
  children: React.ReactNode;
  show: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export function SlideTransition({ 
  children, 
  show, 
  direction = 'up', 
  duration = 'normal',
  className = '' 
}: SlideTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  const directionClasses = {
    up: show ? 'translate-y-0' : 'translate-y-full',
    down: show ? 'translate-y-0' : '-translate-y-full',
    left: show ? 'translate-x-0' : 'translate-x-full',
    right: show ? 'translate-x-0' : '-translate-x-full',
  };

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  const handleTransitionEnd = () => {
    if (!show) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`
        transition-transform ${durationClasses[duration]} ease-in-out
        ${directionClasses[direction]}
        ${className}
      `}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}

// 縮放過渡
interface ScaleTransitionProps {
  children: React.ReactNode;
  show: boolean;
  scale?: 'sm' | 'md' | 'lg';
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export function ScaleTransition({ 
  children, 
  show, 
  scale = 'md', 
  duration = 'normal',
  className = '' 
}: ScaleTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  const scaleClasses = {
    sm: show ? 'scale-100' : 'scale-95',
    md: show ? 'scale-100' : 'scale-90',
    lg: show ? 'scale-100' : 'scale-75',
  };

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  const handleTransitionEnd = () => {
    if (!show) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`
        transition-all ${durationClasses[duration]} ease-in-out
        ${scaleClasses[scale]}
        ${show ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}

// 摺疊過渡
interface CollapseTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export function CollapseTransition({ 
  children, 
  show, 
  duration = 'normal',
  className = '' 
}: CollapseTransitionProps) {
  const [height, setHeight] = useState<number | 'auto'>(show ? 'auto' : 0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      
      if (show) {
        setHeight(contentHeight);
        // 設置為 auto 以支援動態內容
        const timer = setTimeout(() => setHeight('auto'), 300);
        return () => clearTimeout(timer);
      } else {
        setHeight(contentHeight);
        // 強制重排以觸發過渡
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }
  }, [show]);

  return (
    <div
      className={`
        overflow-hidden transition-all ${durationClasses[duration]} ease-in-out
        ${className}
      `}
      style={{ height: height === 'auto' ? 'auto' : `${height}px` }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

// 旋轉過渡
interface RotateTransitionProps {
  children: React.ReactNode;
  show: boolean;
  degrees?: number;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export function RotateTransition({ 
  children, 
  show, 
  degrees = 180, 
  duration = 'normal',
  className = '' 
}: RotateTransitionProps) {
  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  return (
    <div
      className={`
        transition-transform ${durationClasses[duration]} ease-in-out
        ${className}
      `}
      style={{
        transform: show ? `rotate(${degrees}deg)` : 'rotate(0deg)',
      }}
    >
      {children}
    </div>
  );
}

// 彈跳過渡
interface BounceTransitionProps {
  children: React.ReactNode;
  trigger: boolean;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export function BounceTransition({ 
  children, 
  trigger, 
  duration = 'normal',
  className = '' 
}: BounceTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={`
        transition-transform ${durationClasses[duration]} ease-in-out
        ${isAnimating ? 'animate-bounce' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// 震動過渡
interface ShakeTransitionProps {
  children: React.ReactNode;
  trigger: boolean;
  intensity?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ShakeTransition({ 
  children, 
  trigger, 
  intensity = 'md',
  className = '' 
}: ShakeTransitionProps) {
  const [isShaking, setIsShaking] = useState(false);

  const intensityClasses = {
    sm: 'animate-pulse',
    md: 'animate-bounce',
    lg: 'animate-ping',
  };

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={`
        ${isShaking ? intensityClasses[intensity] : ''}
        ${className}
      `}
      style={{
        animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
      }}
    >
      {children}
    </div>
  );
}

// 漸進式載入過渡
interface StaggeredTransitionProps {
  children: React.ReactNode[];
  show: boolean;
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export function StaggeredTransition({ 
  children, 
  show, 
  delay = 100, 
  duration = 'normal',
  className = '' 
}: StaggeredTransitionProps) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(children.length).fill(false)
  );

  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  useEffect(() => {
    if (show) {
      children.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * delay);
      });
    } else {
      setVisibleItems(new Array(children.length).fill(false));
    }
  }, [show, children.length, delay]);

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`
            transition-all ${durationClasses[duration]} ease-out
            ${visibleItems[index] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
            }
          `}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// 頁面過渡包裝器
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`
        transition-all duration-500 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// CSS 動畫樣式
const transitionStyles = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
`;

export { transitionStyles };