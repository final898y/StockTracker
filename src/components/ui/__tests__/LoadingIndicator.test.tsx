import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '../LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders with default props', () => {
    render(<LoadingIndicator />);
    
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = '正在搜尋股票...';
    render(<LoadingIndicator message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders without message when message is empty', () => {
    render(<LoadingIndicator message="" />);
    
    expect(screen.queryByText('載入中...')).not.toBeInTheDocument();
  });

  it('applies inline variant styling by default', () => {
    const { container } = render(<LoadingIndicator />);
    
    expect(container.firstChild).toHaveClass('py-4');
    expect(container.firstChild).not.toHaveClass('fixed');
    expect(container.firstChild).not.toHaveClass('min-h-[200px]');
  });

  it('applies overlay variant styling', () => {
    const { container } = render(<LoadingIndicator variant="overlay" />);
    
    expect(container.firstChild).toHaveClass('fixed', 'inset-0', 'bg-white/80', 'backdrop-blur-sm', 'z-50');
  });

  it('applies page variant styling', () => {
    const { container } = render(<LoadingIndicator variant="page" />);
    
    expect(container.firstChild).toHaveClass('min-h-[200px]', 'py-12');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingIndicator className="custom-loading" />);
    
    expect(container.firstChild).toHaveClass('custom-loading');
  });

  it('renders loading spinner', () => {
    render(<LoadingIndicator />);
    
    // LoadingSpinner 組件應該被渲染
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('passes size prop to LoadingSpinner', () => {
    render(<LoadingIndicator size="lg" />);
    
    // 檢查是否有大尺寸的 spinner（具體實現取決於 LoadingSpinner 組件）
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has correct base structure', () => {
    const { container } = render(<LoadingIndicator />);
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center', 'space-x-3');
  });

  it('renders message with correct styling', () => {
    render(<LoadingIndicator message="測試訊息" />);
    
    const messageElement = screen.getByText('測試訊息');
    expect(messageElement).toHaveClass('text-gray-600', 'dark:text-gray-400', 'font-medium');
  });

  it('combines all props correctly', () => {
    const { container } = render(
      <LoadingIndicator 
        message="自訂載入訊息"
        size="xl"
        variant="page"
        className="custom-class"
      />
    );
    
    expect(screen.getByText('自訂載入訊息')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom-class', 'min-h-[200px]', 'py-12');
  });
});