import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

// 測試組件，會拋出錯誤
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('測試錯誤');
  }
  return <div>正常組件</div>;
};

// 測試組件，會拋出自定義錯誤
const ThrowCustomError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('自定義錯誤訊息');
  }
  return <div>正常組件</div>;
};

describe('ErrorBoundary', () => {
  // 抑制 console.error 在測試中的輸出
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常組件')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('發生了錯誤')).toBeInTheDocument();
    expect(screen.getByText('很抱歉，應用程式遇到了意外錯誤')).toBeInTheDocument();
    expect(screen.getByText('測試錯誤')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>自定義錯誤頁面</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('自定義錯誤頁面')).toBeInTheDocument();
    expect(screen.queryByText('發生了錯誤')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const mockOnError = vi.fn();

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('shows error details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowCustomError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('錯誤詳情')).toBeInTheDocument();
    
    // 點擊展開詳情
    fireEvent.click(screen.getByText('錯誤詳情'));
    
    expect(screen.getByText('錯誤訊息:')).toBeInTheDocument();
    expect(screen.getByText('錯誤堆疊:')).toBeInTheDocument();
    expect(screen.getByText('組件堆疊:')).toBeInTheDocument();
  });

  it('hides error details when showDetails is false', () => {
    render(
      <ErrorBoundary showDetails={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('錯誤詳情')).not.toBeInTheDocument();
  });

  it('resets error state when retry button is clicked', () => {
    // 使用一個可以控制是否拋出錯誤的組件
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('測試錯誤');
      }
      return <div>正常組件</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('發生了錯誤')).toBeInTheDocument();

    // 改變狀態，讓組件不再拋出錯誤
    shouldThrow = false;

    // 點擊重新載入按鈕
    fireEvent.click(screen.getByText('重新載入'));

    // 重新渲染組件
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常組件')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ErrorBoundary className="custom-error-boundary">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.firstChild).toHaveClass('custom-error-boundary');
  });

  it('displays bug icon in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const bugIcon = document.querySelector('.lucide-bug');
    expect(bugIcon).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('wraps component with ErrorBoundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={false} />);

    expect(screen.getByText('正常組件')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('發生了錯誤')).toBeInTheDocument();
  });

  it('passes errorBoundaryProps to ErrorBoundary', () => {
    const mockOnError = vi.fn();
    const WrappedComponent = withErrorBoundary(ThrowError, {
      onError: mockOnError,
      showDetails: true,
    });

    render(<WrappedComponent shouldThrow={true} />);

    expect(mockOnError).toHaveBeenCalled();
    expect(screen.getByText('錯誤詳情')).toBeInTheDocument();
  });

  it('sets correct displayName', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  it('handles component without displayName', () => {
    const TestComponent = () => <div>Test</div>;
    
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});