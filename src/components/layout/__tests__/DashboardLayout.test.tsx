import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DashboardLayout } from '../DashboardLayout';

// Mock the Navigation component
vi.mock('../Navigation', () => ({
  Navigation: (props: any) => (
    <nav data-testid="navigation" {...props}>
      Mock Navigation
    </nav>
  ),
}));

// Mock the ResponsiveLayout component
vi.mock('../ResponsiveLayout', () => ({
  Container: ({ children, ...props }: any) => (
    <div data-testid="container" {...props}>
      {children}
    </div>
  ),
}));

// Mock the Transitions component
vi.mock('@/components/ui/Transitions', () => ({
  PageTransition: ({ children }: any) => <div data-testid="page-transition">{children}</div>,
}));

describe('DashboardLayout', () => {
  const mockChildren = <div data-testid="children">Test Content</div>;

  it('renders children correctly', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>);
    
    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders navigation component', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>);
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByText('Mock Navigation')).toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    render(
      <DashboardLayout title="測試標題" subtitle="測試副標題">
        {mockChildren}
      </DashboardLayout>
    );
    
    expect(screen.getByText('測試標題')).toBeInTheDocument();
    expect(screen.getByText('測試副標題')).toBeInTheDocument();
  });

  it('applies correct layout structure', () => {
    const { container } = render(<DashboardLayout>{mockChildren}</DashboardLayout>);
    
    // 檢查基本的佈局結構
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('renders with custom className', () => {
    render(
      <DashboardLayout className="custom-layout">{mockChildren}</DashboardLayout>
    );
    
    const mainElement = document.querySelector('main');
    expect(mainElement).toHaveClass('custom-layout');
  });

  it('renders Container components', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>);
    
    const containers = screen.getAllByTestId('container');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('renders PageTransition wrapper', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>);
    
    expect(screen.getByTestId('page-transition')).toBeInTheDocument();
  });

  it('renders with actions', () => {
    const actions = <button>測試動作</button>;
    
    render(
      <DashboardLayout actions={actions}>{mockChildren}</DashboardLayout>
    );
    
    expect(screen.getByText('測試動作')).toBeInTheDocument();
  });

  it('maintains layout stability during navigation', () => {
    const { rerender } = render(<DashboardLayout>{mockChildren}</DashboardLayout>);
    
    const newChildren = <div data-testid="new-children">New Content</div>;
    rerender(<DashboardLayout>{newChildren}</DashboardLayout>);
    
    expect(screen.getByTestId('new-children')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    render(<DashboardLayout>{null}</DashboardLayout>);
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('supports multiple children', () => {
    render(
      <DashboardLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </DashboardLayout>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});