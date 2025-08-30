'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { BugIcon } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 呼叫自定義錯誤處理函數
    this.props.onError?.(error, errorInfo);

    // 在開發環境中記錄錯誤
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定義 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 預設錯誤 UI
      return (
        <div className={`p-6 ${this.props.className || ''}`}>
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <BugIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                發生了錯誤
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                很抱歉，應用程式遇到了意外錯誤
              </p>
            </div>

            <ErrorMessage
              message={this.state.error?.message || '未知錯誤'}
              variant="card"
              severity="error"
              onRetry={this.handleRetry}
              retryText="重新載入"
            />

            {this.props.showDetails && this.state.error && (
              <details className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  錯誤詳情
                </summary>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  <div className="mb-2">
                    <strong>錯誤訊息:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>錯誤堆疊:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>組件堆疊:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook 版本的 ErrorBoundary（用於函數組件）
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}