'use client';

import React from 'react';
import { AlertCircleIcon, XIcon, RefreshCwIcon } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'inline' | 'banner' | 'card' | 'toast';
  severity?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissible?: boolean;
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  variant = 'inline',
  severity = 'error',
  onRetry,
  onDismiss,
  retryText = '重試',
  dismissible = false,
  className = ''
}: ErrorMessageProps) {
  const getSeverityClasses = () => {
    switch (severity) {
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-500 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-500 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-200',
          message: 'text-yellow-700 dark:text-yellow-300',
          button: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200',
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-500 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          button: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200',
        };
      default:
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-500 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'banner':
        return 'border-l-4 p-4';
      case 'card':
        return 'border rounded-lg p-6 shadow-sm';
      case 'toast':
        return 'border rounded-lg p-4 shadow-lg';
      case 'inline':
      default:
        return 'border rounded-lg p-4';
    }
  };

  const severityClasses = getSeverityClasses();
  const variantClasses = getVariantClasses();

  return (
    <div className={`${severityClasses.container} ${variantClasses} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircleIcon className={`h-5 w-5 ${severityClasses.icon}`} />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${severityClasses.title} mb-1`}>
              {title}
            </h3>
          )}
          
          <div className={`text-sm ${severityClasses.message}`}>
            {message}
          </div>
          
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium 
                          rounded-md transition-colors ${severityClasses.button}`}
              >
                <RefreshCwIcon className="h-3 w-3" />
                <span>{retryText}</span>
              </button>
            </div>
          )}
        </div>
        
        {(dismissible || onDismiss) && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 transition-colors 
                        hover:bg-black/5 dark:hover:bg-white/5 ${severityClasses.icon}`}
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}