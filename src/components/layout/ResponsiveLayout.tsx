'use client';

import React from 'react';

// 響應式容器
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Container({ children, size = 'xl', className = '' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`container-responsive ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}

// 響應式網格
interface GridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Grid({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3, xl: 4 }, 
  gap = 'md',
  className = '' 
}: GridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const getGridClasses = () => {
    let classes = 'grid';
    
    if (cols.default) classes += ` ${gridCols[cols.default as keyof typeof gridCols]}`;
    if (cols.sm) classes += ` sm:${gridCols[cols.sm as keyof typeof gridCols]}`;
    if (cols.md) classes += ` md:${gridCols[cols.md as keyof typeof gridCols]}`;
    if (cols.lg) classes += ` lg:${gridCols[cols.lg as keyof typeof gridCols]}`;
    if (cols.xl) classes += ` xl:${gridCols[cols.xl as keyof typeof gridCols]}`;
    
    return classes;
  };

  return (
    <div className={`${getGridClasses()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// 響應式 Flex 佈局
interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: boolean;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align'>>;
    md?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align'>>;
    lg?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align'>>;
  };
  className?: string;
}

export function Flex({ 
  children, 
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 'md',
  responsive,
  className = '' 
}: FlexProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const getResponsiveClasses = () => {
    let classes = '';
    
    if (responsive?.sm) {
      if (responsive.sm.direction) classes += ` sm:${directionClasses[responsive.sm.direction]}`;
      if (responsive.sm.justify) classes += ` sm:${justifyClasses[responsive.sm.justify]}`;
      if (responsive.sm.align) classes += ` sm:${alignClasses[responsive.sm.align]}`;
    }
    
    if (responsive?.md) {
      if (responsive.md.direction) classes += ` md:${directionClasses[responsive.md.direction]}`;
      if (responsive.md.justify) classes += ` md:${justifyClasses[responsive.md.justify]}`;
      if (responsive.md.align) classes += ` md:${alignClasses[responsive.md.align]}`;
    }
    
    if (responsive?.lg) {
      if (responsive.lg.direction) classes += ` lg:${directionClasses[responsive.lg.direction]}`;
      if (responsive.lg.justify) classes += ` lg:${justifyClasses[responsive.lg.justify]}`;
      if (responsive.lg.align) classes += ` lg:${alignClasses[responsive.lg.align]}`;
    }
    
    return classes;
  };

  return (
    <div 
      className={`
        flex 
        ${directionClasses[direction]} 
        ${justifyClasses[justify]} 
        ${alignClasses[align]} 
        ${gapClasses[gap]}
        ${wrap ? 'flex-wrap' : ''}
        ${getResponsiveClasses()}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// 響應式卡片佈局
interface CardLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function CardLayout({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className = '' 
}: CardLayoutProps) {
  const variantClasses = {
    default: 'card',
    elevated: 'card shadow-lg',
    outlined: 'border-2 border-border rounded-lg bg-card',
    filled: 'bg-muted rounded-lg',
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

// 響應式側邊欄佈局
interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function SidebarLayout({ 
  children, 
  sidebar, 
  sidebarPosition = 'left',
  sidebarWidth = 'md',
  collapsible = false,
  defaultCollapsed = false,
  className = '' 
}: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  };

  const collapsedWidthClasses = {
    sm: 'w-16',
    md: 'w-20',
    lg: 'w-24',
  };

  return (
    <div className={`flex h-full ${className}`}>
      {sidebarPosition === 'left' && (
        <aside 
          className={`
            ${isCollapsed ? collapsedWidthClasses[sidebarWidth] : widthClasses[sidebarWidth]}
            flex-shrink-0 transition-all duration-300 ease-in-out
            bg-muted border-r border-border
            hidden lg:block
          `}
        >
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          )}
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            {sidebar}
          </div>
        </aside>
      )}
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      {sidebarPosition === 'right' && (
        <aside 
          className={`
            ${isCollapsed ? collapsedWidthClasses[sidebarWidth] : widthClasses[sidebarWidth]}
            flex-shrink-0 transition-all duration-300 ease-in-out
            bg-muted border-l border-border
            hidden lg:block
          `}
        >
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
            >
              {isCollapsed ? '←' : '→'}
            </button>
          )}
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            {sidebar}
          </div>
        </aside>
      )}
    </div>
  );
}

// 響應式堆疊佈局
interface StackProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export function Stack({ children, spacing = 'md', align = 'stretch', className = '' }: StackProps) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div className={`flex flex-col ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}

// 響應式分隔器
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  const orientationClasses = {
    horizontal: 'w-full h-px border-t border-border',
    vertical: 'h-full w-px border-l border-border',
  };

  return <div className={`${orientationClasses[orientation]} ${className}`} role="separator" />;
}

// 響應式間距組件
interface SpacerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis?: 'x' | 'y' | 'both';
  className?: string;
}

export function Spacer({ size = 'md', axis = 'y', className = '' }: SpacerProps) {
  const sizeClasses = {
    sm: '1',
    md: '4',
    lg: '8',
    xl: '12',
    '2xl': '16',
  };

  const axisClasses = {
    x: `w-${sizeClasses[size]}`,
    y: `h-${sizeClasses[size]}`,
    both: `w-${sizeClasses[size]} h-${sizeClasses[size]}`,
  };

  return <div className={`${axisClasses[axis]} ${className}`} aria-hidden="true" />;
}