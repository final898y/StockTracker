import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Navigation } from '../Navigation';

// Mock Next.js navigation
const mockPathname = '/dashboard';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock ThemeToggle component
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: (props: any) => (
    <button data-testid="theme-toggle" {...props}>
      Theme Toggle
    </button>
  ),
}));

// Mock ResponsiveLayout
vi.mock('../ResponsiveLayout', () => ({
  Container: ({ children }: any) => <div data-testid="container">{children}</div>,
}));

describe('Navigation', () => {
  const mockOnToggleSidebar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation brand/logo', () => {
    render(<Navigation />);
    
    expect(screen.getByText('股票追蹤器')).toBeInTheDocument();
  });

  it('renders main navigation links', () => {
    render(<Navigation />);
    
    expect(screen.getByText('首頁')).toBeInTheDocument();
    expect(screen.getByText('儀表板')).toBeInTheDocument();
    expect(screen.getByText('搜尋')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(<Navigation />);
    
    // 檢查當前路徑對應的導航項目是否被高亮
    const dashboardLink = screen.getByText('儀表板');
    expect(dashboardLink.closest('a')).toHaveClass('bg-accent');
  });

  it('renders correct navigation links', () => {
    render(<Navigation />);
    
    const searchLink = screen.getByText('搜尋');
    expect(searchLink.closest('a')).toHaveAttribute('href', '/search');
  });

  it('renders theme toggle button', () => {
    render(<Navigation />);
    
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeInTheDocument();
  });

  it('renders mobile menu toggle', () => {
    render(<Navigation />);
    
    const menuToggle = screen.getByLabelText('開啟選單');
    expect(menuToggle).toBeInTheDocument();
  });

  it('toggles mobile menu when clicked', () => {
    render(<Navigation />);
    
    const menuToggle = screen.getByLabelText('開啟選單');
    
    // 初始狀態應該顯示 Menu 圖標
    expect(document.querySelector('.lucide-menu')).toBeInTheDocument();
    
    // 點擊後應該顯示 X 圖標
    fireEvent.click(menuToggle);
    expect(document.querySelector('.lucide-x')).toBeInTheDocument();
  });

  it('shows mobile menu when toggled', () => {
    render(<Navigation />);
    
    const menuToggle = screen.getByLabelText('開啟選單');
    fireEvent.click(menuToggle);
    
    // 檢查行動版選單是否顯示
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<Navigation className="custom-nav" />);
    
    expect(container.firstChild).toHaveClass('custom-nav');
  });

  it('renders settings button', () => {
    render(<Navigation />);
    
    const settingsButton = screen.getByTitle('設定');
    expect(settingsButton).toBeInTheDocument();
  });

  it('renders Container component', () => {
    render(<Navigation />);
    
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });
});