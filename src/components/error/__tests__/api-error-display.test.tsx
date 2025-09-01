import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ApiErrorDisplay } from '../api-error-display';

describe('ApiErrorDisplay', () => {
  const mockOnRetry = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders API rate limit error correctly', () => {
    const error = {
      code: 'API_RATE_LIMIT',
      message: 'API call frequency is 5 calls per minute',
      details: { provider: 'Alpha Vantage', remaining: 0 },
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('API 使用量限制')).toBeInTheDocument();
    expect(screen.getByText('API 請求次數已達上限，請稍後再試')).toBeInTheDocument();
  });

  it('renders asset not found error correctly', () => {
    const error = {
      code: 'ASSET_NOT_FOUND',
      message: 'Symbol not found',
      details: { symbol: 'INVALID' },
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('找不到資產')).toBeInTheDocument();
    expect(screen.getByText('找不到指定的資產')).toBeInTheDocument();
  });

  it('renders network error correctly', () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: 'Network request failed',
      details: { code: 'ECONNREFUSED' },
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('網路連線錯誤')).toBeInTheDocument();
    expect(screen.getByText('網路連線發生錯誤')).toBeInTheDocument();
  });

  it('renders external API error correctly', () => {
    const error = {
      code: 'EXTERNAL_API_ERROR',
      message: 'Third party service unavailable',
      details: { service: 'CoinGecko' },
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('載入錯誤')).toBeInTheDocument();
    expect(screen.getByText('外部 API 發生錯誤')).toBeInTheDocument();
  });

  it('renders unknown error correctly', () => {
    const error = {
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong',
      details: {},
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('載入錯誤')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: 'Connection failed',
    };

    render(<ApiErrorDisplay error={error} onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByText('重試');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: 'Connection failed',
    };

    render(<ApiErrorDisplay error={error} onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByText('重試');
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when showRetryButton is false', () => {
    const error = {
      code: 'API_RATE_LIMIT',
      message: 'Rate limit exceeded',
    };

    render(<ApiErrorDisplay error={error} onRetry={mockOnRetry} showRetryButton={false} />);
    
    expect(screen.queryByText('重試')).not.toBeInTheDocument();
  });

  it('applies custom size classes', () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: 'Connection failed',
    };

    const { container } = render(<ApiErrorDisplay error={error} size="lg" />);
    
    expect(container.firstChild).toHaveClass('p-6', 'text-lg');
  });

  it('displays appropriate icon for each error type', () => {
    const { rerender } = render(
      <ApiErrorDisplay error={{ code: 'API_RATE_LIMIT', message: 'Rate limit' }} />
    );
    expect(document.querySelector('.lucide-clock')).toBeInTheDocument();

    rerender(
      <ApiErrorDisplay error={{ code: 'NETWORK_ERROR', message: 'Network error' }} />
    );
    expect(document.querySelector('.lucide-wifi-off')).toBeInTheDocument();

    rerender(
      <ApiErrorDisplay error={{ code: 'ASSET_NOT_FOUND', message: 'Not found' }} />
    );
    expect(document.querySelector('.lucide-trending-down')).toBeInTheDocument();
  });

  it('shows helpful tips for rate limit errors', () => {
    const error = {
      code: 'API_RATE_LIMIT',
      message: 'Rate limit exceeded',
      details: {
        remaining: 0,
        resetTime: '2024-01-01T12:00:00Z',
        provider: 'Alpha Vantage',
      },
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText(/請稍等片刻後再試/)).toBeInTheDocument();
  });

  it('shows helpful tips for network errors', () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: 'Connection failed',
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText(/請檢查網路連線狀態/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const error = {
      errorCode: 'NETWORK_ERROR',
      message: 'Connection failed',
    };

    const { container } = render(
      <ApiErrorDisplay error={error} className="custom-error-display" />
    );
    
    expect(container.firstChild).toHaveClass('custom-error-display');
  });

  it('handles missing error details gracefully', () => {
    const error = {
      code: 'API_RATE_LIMIT',
      message: 'Rate limit exceeded',
      // details 未定義
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('API 使用量限制')).toBeInTheDocument();
    expect(screen.getByText('API 請求次數已達上限，請稍後再試')).toBeInTheDocument();
  });

  it('handles empty error message', () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: '',
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('網路連線錯誤')).toBeInTheDocument();
    expect(screen.getByText('網路連線發生錯誤')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: 'Connection failed',
    };

    const { container } = render(
      <ApiErrorDisplay error={error} className="custom-error-display" />
    );
    
    expect(container.firstChild).toHaveClass('custom-error-display');
  });

  it('handles missing error code', () => {
    const error = {
      message: 'Something went wrong',
    };

    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('載入錯誤')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('combines all props correctly', () => {
    const error = {
      code: 'EXTERNAL_API_ERROR',
      message: 'Service unavailable',
      details: { service: 'CoinGecko' },
    };

    const { container } = render(
      <ApiErrorDisplay 
        error={error}
        onRetry={mockOnRetry}
        size="lg"
        className="full-test"
      />
    );
    
    expect(screen.getByText('載入錯誤')).toBeInTheDocument();
    expect(screen.getByText('外部 API 發生錯誤')).toBeInTheDocument();
    expect(screen.getByText('重試')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('full-test');
    expect(container.firstChild).toHaveClass('p-6', 'text-lg');
  });
});