import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  const mockOnRetry = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders basic error message', () => {
    render(<ErrorMessage message="測試錯誤訊息" />);
    
    expect(screen.getByText('測試錯誤訊息')).toBeInTheDocument();
  });

  it('renders with error severity by default', () => {
    const { container } = render(<ErrorMessage message="錯誤" />);
    
    // 檢查是否有錯誤相關的樣式類別
    expect(container.querySelector('.text-red-700')).toBeInTheDocument();
  });

  it('renders with warning severity', () => {
    const { container } = render(<ErrorMessage message="警告" severity="warning" />);
    
    // 檢查是否有警告相關的樣式類別
    expect(container.querySelector('.text-yellow-700')).toBeInTheDocument();
  });

  it('renders with info severity', () => {
    const { container } = render(<ErrorMessage message="資訊" severity="info" />);
    
    // 檢查是否有資訊相關的樣式類別
    expect(container.querySelector('.text-blue-700')).toBeInTheDocument();
  });

  it('renders inline variant by default', () => {
    const { container } = render(<ErrorMessage message="錯誤" />);
    
    // inline variant 應該有特定的樣式
    expect(container.firstChild).toHaveClass('p-4');
  });

  it('renders card variant', () => {
    const { container } = render(<ErrorMessage message="錯誤" variant="card" />);
    
    // card variant 應該有特定的樣式
    expect(container.firstChild).toHaveClass('p-6', 'rounded-lg', 'border');
  });

  it('renders banner variant', () => {
    const { container } = render(<ErrorMessage message="錯誤" variant="banner" />);
    
    // banner variant 應該有特定的樣式
    expect(container.firstChild).toHaveClass('border-l-4', 'p-4');
  });

  it('shows retry button when onRetry is provided', () => {
    render(<ErrorMessage message="錯誤" onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByText('重試');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<ErrorMessage message="錯誤" onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByText('重試');
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('shows custom retry text', () => {
    render(<ErrorMessage message="錯誤" onRetry={mockOnRetry} retryText="重新載入" />);
    
    expect(screen.getByText('重新載入')).toBeInTheDocument();
  });

  it('shows dismiss button when onDismiss is provided', () => {
    render(<ErrorMessage message="錯誤" onDismiss={mockOnDismiss} dismissible={true} />);
    
    const dismissButton = document.querySelector('.lucide-x');
    expect(dismissButton).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<ErrorMessage message="錯誤" onDismiss={mockOnDismiss} dismissible={true} />);
    
    const dismissButton = document.querySelector('.lucide-x')?.closest('button');
    if (dismissButton) {
      fireEvent.click(dismissButton);
    }
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows both retry and dismiss buttons', () => {
    render(<ErrorMessage message="錯誤" onRetry={mockOnRetry} onDismiss={mockOnDismiss} dismissible={true} />);
    
    expect(screen.getByText('重試')).toBeInTheDocument();
    const dismissButton = document.querySelector('.lucide-x');
    expect(dismissButton).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const title = '錯誤標題';
    render(<ErrorMessage message="錯誤" title={title} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ErrorMessage message="錯誤" className="custom-error" />);
    
    expect(container.firstChild).toHaveClass('custom-error');
  });

  it('renders appropriate icon for each severity', () => {
    // All severities use AlertCircleIcon in this implementation
    const { rerender } = render(<ErrorMessage message="錯誤" severity="error" />);
    expect(document.querySelector('.lucide-circle-alert')).toBeInTheDocument();

    // Warning severity
    rerender(<ErrorMessage message="警告" severity="warning" />);
    expect(document.querySelector('.lucide-circle-alert')).toBeInTheDocument();

    // Info severity
    rerender(<ErrorMessage message="資訊" severity="info" />);
    expect(document.querySelector('.lucide-circle-alert')).toBeInTheDocument();
  });

  it('handles long error messages', () => {
    const longMessage = '這是一個非常長的錯誤訊息，用來測試組件如何處理長文本內容，確保它能夠正確顯示而不會破壞佈局。';
    render(<ErrorMessage message={longMessage} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles empty message gracefully', () => {
    render(<ErrorMessage message="" />);
    
    // 應該仍然渲染組件結構
    const container = document.querySelector('.p-4');
    expect(container).toBeInTheDocument();
  });

  it('combines all props correctly', () => {
    const { container } = render(
      <ErrorMessage 
        message="完整測試錯誤"
        title="錯誤標題"
        severity="warning"
        variant="card"
        onRetry={mockOnRetry}
        onDismiss={mockOnDismiss}
        retryText="重新嘗試"
        className="full-test"
      />
    );
    
    expect(screen.getByText('完整測試錯誤')).toBeInTheDocument();
    expect(screen.getByText('錯誤標題')).toBeInTheDocument();
    expect(screen.getByText('重新嘗試')).toBeInTheDocument();
    const dismissButton = document.querySelector('.lucide-x');
    expect(dismissButton).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('full-test');
    expect(container.querySelector('.text-yellow-500')).toBeInTheDocument();
  });
});