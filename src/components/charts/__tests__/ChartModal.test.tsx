import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ChartModal } from '../ChartModal';
import { Asset } from '@/types';
import { useChartData } from '@/hooks/use-chart-data';
import { useChartStore } from '@/stores/chart-store';

// Mock the InteractiveChart component
vi.mock('../InteractiveChart', () => ({
  InteractiveChart: ({ 
    data, 
    asset,
    timeframe,
    onTimeframeChange,
    onRefresh,
    isLoading,
    minHeight,
    maxHeight,
    aspectRatio,
    ...rest 
  }: any) => (
    <div data-testid="interactive-chart" {...rest}>
      <div data-testid="candlestick-chart">Mock Chart with {data?.length || 0} data points</div>
      <div data-testid="time-range-selector">
        <button>1天</button>
        <button>1週</button>
        <button>1月</button>
      </div>
    </div>
  ),
}));

// Mock the chart data hook
vi.mock('@/hooks/use-chart-data', () => ({
  useChartData: vi.fn(),
}));

// Mock the chart store
vi.mock('@/stores/chart-store', () => ({
  useChartStore: vi.fn(),
}));

const mockUseChartData = vi.mocked(useChartData);
const mockUseChartStore = vi.mocked(useChartStore);

const mockAsset: Asset = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  assetType: 'stock',
  exchange: 'NASDAQ',
};

describe('ChartModal', () => {
  const mockOnClose = vi.fn();
  const mockRefetch = vi.fn();
  const mockSetTimeframe = vi.fn();
  const mockToggleFullscreen = vi.fn();
  const mockSetFullscreen = vi.fn();
  const mockUpdateLastRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseChartData.mockReturnValue({
      data: {
        data: [
          {
            open: 100,
            high: 110,
            low: 95,
            close: 105,
            volume: 1000,
            timestamp: 1704067200, // 2024-01-01 timestamp
          },
          {
            open: 105,
            high: 115,
            low: 100,
            close: 110,
            volume: 1200,
            timestamp: 1704153600, // 2024-01-02 timestamp
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockUseChartStore.mockReturnValue({
      currentAsset: mockAsset,
      timeframe: '1M',
      isFullscreen: false,
      autoRefresh: false,
      refreshInterval: 30000,
      setTimeframe: mockSetTimeframe,
      toggleFullscreen: mockToggleFullscreen,
      setFullscreen: mockSetFullscreen,
      updateLastRefresh: mockUpdateLastRefresh,
    });
  });

  it('renders when open is true', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('interactive-chart')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<ChartModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByTestId('interactive-chart')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByTitle('關閉 (ESC)');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const modalContent = screen.getByTestId('interactive-chart');
    fireEvent.click(modalContent);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('handles time range change', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const weekButton = screen.getByText('1週');
    fireEvent.click(weekButton);
    // The timeframe change is handled by InteractiveChart component
  });

  it('displays loading state', () => {
    mockUseChartData.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('載入中')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseChartData.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('無法載入圖表資料'),
      refetch: mockRefetch,
    });

    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('載入圖表資料失敗')).toBeInTheDocument();
  });

  it('shows retry button in error state', () => {
    mockUseChartData.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('載入失敗'),
      refetch: mockRefetch,
    });

    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const retryButton = screen.getByText('重新載入');
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders crypto item correctly', () => {
    const cryptoAsset: Asset = {
      symbol: 'BTC',
      name: 'Bitcoin',
      assetType: 'crypto',
    };

    mockUseChartStore.mockReturnValue({
      currentAsset: cryptoAsset,
      timeframe: '1M',
      isFullscreen: false,
      autoRefresh: false,
      refreshInterval: 30000,
      setTimeframe: mockSetTimeframe,
      toggleFullscreen: mockToggleFullscreen,
      setFullscreen: mockSetFullscreen,
      updateLastRefresh: mockUpdateLastRefresh,
    });

    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('interactive-chart')).toBeInTheDocument();
  });

  it('displays current price information', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('interactive-chart')).toBeInTheDocument();
  });

  it('shows fullscreen toggle button', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const fullscreenButton = screen.getByTitle('全螢幕 (F11)');
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('handles fullscreen toggle', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const fullscreenButton = screen.getByTitle('全螢幕 (F11)');
    fireEvent.click(fullscreenButton);
    expect(mockToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('does not render when currentAsset is null', () => {
    mockUseChartStore.mockReturnValue({
      currentAsset: null,
      timeframe: '1M',
      isFullscreen: false,
      autoRefresh: false,
      refreshInterval: 30000,
      setTimeframe: mockSetTimeframe,
      toggleFullscreen: mockToggleFullscreen,
      setFullscreen: mockSetFullscreen,
      updateLastRefresh: mockUpdateLastRefresh,
    });

    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.queryByTestId('interactive-chart')).not.toBeInTheDocument();
  });

  it('handles fullscreen mode correctly', () => {
    mockUseChartStore.mockReturnValue({
      currentAsset: mockAsset,
      timeframe: '1M',
      isFullscreen: true,
      autoRefresh: false,
      refreshInterval: 30000,
      setTimeframe: mockSetTimeframe,
      toggleFullscreen: mockToggleFullscreen,
      setFullscreen: mockSetFullscreen,
      updateLastRefresh: mockUpdateLastRefresh,
    });

    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    
    // In fullscreen mode, ESC should exit fullscreen instead of closing modal
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockSetFullscreen).toHaveBeenCalledWith(false);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows real-time update toggle', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const realTimeButton = screen.getByTitle('關閉即時更新');
    expect(realTimeButton).toBeInTheDocument();
  });

  it('shows manual refresh button', () => {
    render(<ChartModal isOpen={true} onClose={mockOnClose} />);
    const refreshButton = screen.getByTitle('手動刷新 (Ctrl+R)');
    expect(refreshButton).toBeInTheDocument();
    
    fireEvent.click(refreshButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});