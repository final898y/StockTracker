'use client';

import React from 'react';
import { Navigation } from './Navigation';
import { Container } from './ResponsiveLayout';
import { PageTransition } from '@/components/ui/Transitions';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = '' 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <PageTransition>
        <main className={`pb-8 ${className}`}>
          {(title || subtitle || actions) && (
            <div className="bg-muted/30 border-b border-border" data-testid="header">
              <Container>
                <div className="py-6 sm:py-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      {title && (
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                          {title}
                        </h1>
                      )}
                      {subtitle && (
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    {actions && (
                      <div className="flex items-center space-x-3">
                        {actions}
                      </div>
                    )}
                  </div>
                </div>
              </Container>
            </div>
          )}
          
          <Container>
            <div className="py-6 sm:py-8">
              {children}
            </div>
          </Container>
        </main>
      </PageTransition>
    </div>
  );
}