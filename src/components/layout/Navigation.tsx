'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUpIcon, 
  MenuIcon, 
  XIcon,
  HomeIcon,
  BarChart3Icon,
  SearchIcon,
  SettingsIcon
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Container } from './ResponsiveLayout';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: '首頁', icon: HomeIcon },
    { href: '/dashboard', label: '儀表板', icon: BarChart3Icon },
    { href: '/search', label: '搜尋', icon: SearchIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={`bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-40 ${className}`}>
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <TrendingUpIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              股票追蹤器
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                    transition-colors hover:bg-accent hover:text-accent-foreground
                    ${isActive(item.href) 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div> 
         {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle variant="dropdown" size="sm" />

            {/* Settings (Desktop) */}
            <button
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-md
                       hover:bg-accent hover:text-accent-foreground transition-colors
                       text-muted-foreground"
              title="設定"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-md
                       hover:bg-accent hover:text-accent-foreground transition-colors
                       text-muted-foreground"
              aria-label="開啟選單"
            >
              {isMobileMenuOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium
                      transition-colors hover:bg-accent hover:text-accent-foreground
                      ${isActive(item.href) 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Settings */}
              <button
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium
                         text-muted-foreground hover:bg-accent hover:text-accent-foreground
                         transition-colors w-full"
              >
                <SettingsIcon className="h-5 w-5" />
                <span>設定</span>
              </button>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}

// 簡化版導航（用於特定頁面）
interface SimpleNavigationProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function SimpleNavigation({ 
  title, 
  showBack = false, 
  onBack, 
  actions,
  className = '' 
}: SimpleNavigationProps) {
  return (
    <nav className={`bg-background/80 backdrop-blur-sm border-b border-border ${className}`}>
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBack && (
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 rounded-md
                         hover:bg-accent hover:text-accent-foreground transition-colors
                         text-muted-foreground"
                aria-label="返回"
              >
                ←
              </button>
            )}
            
            {title && (
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {actions}
            <ThemeToggle variant="button" size="sm" />
          </div>
        </div>
      </Container>
    </nav>
  );
}