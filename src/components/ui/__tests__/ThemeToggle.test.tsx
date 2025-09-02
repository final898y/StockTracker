import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ThemeToggle, ThemeIndicator } from '../ThemeToggle';
import { useThemeToggle } from '@/contexts/theme-context';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the theme context
const mockSetLightTheme = vi.fn();
const mockSetDarkTheme = vi.fn();
const mockSetSystemTheme = vi.fn();
const mockToggleTheme = vi.fn();
const mockSetTheme = vi.fn();

vi.mock('@/contexts/theme-context', () => ({
  useThemeToggle: vi.fn(),
}));

const mockUseThemeToggle = vi.mocked(useThemeToggle);

describe('ThemeToggle', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThemeToggle.mockReturnValue({
      theme: 'light',
      isLight: true,
      isDark: false,
      isSystem: false,
      actualTheme: 'light',
      setLightTheme: mockSetLightTheme,
      setDarkTheme: mockSetDarkTheme,
      setSystemTheme: mockSetSystemTheme,
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });
  });

  describe('button variant', () => {
    it('renders button variant by default', () => {
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', '切換主題');
    });

    it('shows sun icon for light theme', () => {
      render(<ThemeToggle />);
      
      // Check for SVG icon (Lucide icons render as SVG)
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('shows moon icon for dark theme', () => {
      mockUseThemeToggle.mockReturnValue({
        theme: 'dark',
        isLight: false,
        isDark: true,
        isSystem: false,
        actualTheme: 'dark',
        setLightTheme: mockSetLightTheme,
        setDarkTheme: mockSetDarkTheme,
        setSystemTheme: mockSetSystemTheme,
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);
      
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('shows monitor icon for system theme', () => {
      mockUseThemeToggle.mockReturnValue({
        theme: 'system',
        isLight: false,
        isDark: false,
        isSystem: true,
        actualTheme: 'light',
        setLightTheme: mockSetLightTheme,
        setDarkTheme: mockSetDarkTheme,
        setSystemTheme: mockSetSystemTheme,
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);
      
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('calls toggleTheme when clicked', async () => {
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('shows label when showLabel is true', () => {
      render(<ThemeToggle showLabel={true} />);
      
      expect(screen.getByText('淺色')).toBeInTheDocument();
    });

    it('applies different sizes', () => {
      const { rerender } = render(<ThemeToggle size="sm" />);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'w-8');

      rerender(<ThemeToggle size="lg" />);
      button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'w-12');
    });

    it('applies custom className', () => {
      render(<ThemeToggle className="custom-theme-toggle" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-theme-toggle');
    });
  });

  describe('switch variant', () => {
    it('renders switch variant', () => {
      render(<ThemeToggle variant="switch" />);
      
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute('aria-label', '切換深色模式');
    });

    it('shows correct state for light theme', () => {
      render(<ThemeToggle variant="switch" />);
      
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('shows correct state for dark theme', () => {
      mockUseThemeToggle.mockReturnValue({
        theme: 'dark',
        isLight: false,
        isDark: true,
        isSystem: false,
        actualTheme: 'dark',
        setLightTheme: mockSetLightTheme,
        setDarkTheme: mockSetDarkTheme,
        setSystemTheme: mockSetSystemTheme,
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle variant="switch" />);
      
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('calls setDarkTheme when switching from light to dark', async () => {
      render(<ThemeToggle variant="switch" />);
      
      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);
      
      expect(mockSetDarkTheme).toHaveBeenCalledTimes(1);
    });

    it('calls setLightTheme when switching from dark to light', async () => {
      mockUseThemeToggle.mockReturnValue({
        theme: 'dark',
        isLight: false,
        isDark: true,
        isSystem: false,
        actualTheme: 'dark',
        setLightTheme: mockSetLightTheme,
        setDarkTheme: mockSetDarkTheme,
        setSystemTheme: mockSetSystemTheme,
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle variant="switch" />);
      
      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);
      
      expect(mockSetLightTheme).toHaveBeenCalledTimes(1);
    });

    it('shows label when showLabel is true', () => {
      render(<ThemeToggle variant="switch" showLabel={true} />);
      
      expect(screen.getByText('深色模式')).toBeInTheDocument();
    });
  });

  describe('dropdown variant', () => {
    it('renders dropdown variant with all theme options', () => {
      render(<ThemeToggle variant="dropdown" />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      expect(screen.getByTitle('淺色主題')).toBeInTheDocument();
      expect(screen.getByTitle('深色主題')).toBeInTheDocument();
      expect(screen.getByTitle('跟隨系統主題')).toBeInTheDocument();
    });

    it('highlights current theme', () => {
      render(<ThemeToggle variant="dropdown" />);
      
      const lightButton = screen.getByTitle('淺色主題');
      expect(lightButton).toHaveClass('bg-primary');
    });

    it('calls setLightTheme when light button is clicked', async () => {
      render(<ThemeToggle variant="dropdown" />);
      
      const lightButton = screen.getByTitle('淺色主題');
      await user.click(lightButton);
      
      expect(mockSetLightTheme).toHaveBeenCalledTimes(1);
    });

    it('calls setDarkTheme when dark button is clicked', async () => {
      render(<ThemeToggle variant="dropdown" />);
      
      const darkButton = screen.getByTitle('深色主題');
      await user.click(darkButton);
      
      expect(mockSetDarkTheme).toHaveBeenCalledTimes(1);
    });

    it('calls setSystemTheme when system button is clicked', async () => {
      render(<ThemeToggle variant="dropdown" />);
      
      const systemButton = screen.getByTitle('跟隨系統主題');
      await user.click(systemButton);
      
      expect(mockSetSystemTheme).toHaveBeenCalledTimes(1);
    });

    it('shows label when showLabel is true', () => {
      render(<ThemeToggle variant="dropdown" showLabel={true} />);
      
      expect(screen.getByText('淺色模式')).toBeInTheDocument();
    });

    it('highlights system theme when active', () => {
      mockUseThemeToggle.mockReturnValue({
        theme: 'system',
        isLight: false,
        isDark: false,
        isSystem: true,
        actualTheme: 'light',
        setLightTheme: mockSetLightTheme,
        setDarkTheme: mockSetDarkTheme,
        setSystemTheme: mockSetSystemTheme,
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle variant="dropdown" />);
      
      const systemButton = screen.getByTitle('跟隨系統主題');
      expect(systemButton).toHaveClass('bg-primary');
    });
  });

  it('returns null for invalid variant', () => {
    const { container } = render(<ThemeToggle variant={'invalid' as any} />);
    
    expect(container.firstChild).toBeNull();
  });
});

describe('ThemeIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThemeToggle.mockReturnValue({
      theme: 'light',
      isLight: true,
      isDark: false,
      isSystem: false,
      actualTheme: 'light',
      setLightTheme: mockSetLightTheme,
      setDarkTheme: mockSetDarkTheme,
      setSystemTheme: mockSetSystemTheme,
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });
  });

  it('renders theme indicator for light theme', () => {
    render(<ThemeIndicator />);
    
    expect(screen.getByText('淺色模式')).toBeInTheDocument();
    
    const indicator = document.querySelector('.bg-yellow-500');
    expect(indicator).toBeInTheDocument();
  });

  it('renders theme indicator for dark theme', () => {
    mockUseThemeToggle.mockReturnValue({
      theme: 'dark',
      isLight: false,
      isDark: true,
      isSystem: false,
      actualTheme: 'dark',
      setLightTheme: mockSetLightTheme,
      setDarkTheme: mockSetDarkTheme,
      setSystemTheme: mockSetSystemTheme,
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });

    render(<ThemeIndicator />);
    
    expect(screen.getByText('深色模式')).toBeInTheDocument();
    
    const indicator = document.querySelector('.bg-blue-500');
    expect(indicator).toBeInTheDocument();
  });

  it('renders theme indicator for system theme', () => {
    mockUseThemeToggle.mockReturnValue({
      theme: 'system',
      isLight: false,
      isDark: false,
      isSystem: true,
      actualTheme: 'dark',
      setLightTheme: mockSetLightTheme,
      setDarkTheme: mockSetDarkTheme,
      setSystemTheme: mockSetSystemTheme,
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });

    render(<ThemeIndicator />);
    
    expect(screen.getByText('跟隨系統 (深色)')).toBeInTheDocument();
    
    const indicator = document.querySelector('.bg-blue-500');
    expect(indicator).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ThemeIndicator className="custom-indicator" />);
    
    expect(container.firstChild).toHaveClass('custom-indicator');
  });
});