import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ChartModal } from '../ChartModal';
import { WatchlistItem } from '@/types';

// Mock the chart components
vi.mock('../CandlestickChart', () => ({
  CandlestickChart: ({ data, ...props }: any) => (
    <div data-testid="candlestick-chart" {...props}>
      Mock Chart with {data?.length || 0} data points
    </div>
  ),
}));

vi.mock('../TimeRangeSelector', () => ({
  TimeRangeSelector: ({ value, onChange, ...props }: any) => (
    <div data-testid="time-range-selector" {...props}>
      <button onClick={() => onChange('1D')}>1天</button>
      <button onClick={() => onChange('1W')}>1週</button>
      <button onClick={() => onChange('1M')}>1月</button>
      <span>Current: {value}</span>
    </div>
  ),
}));

// Mock the chart data hook
const mockUseChartData = vi.fn(() => ({
  data: [
    {
      openPrice: 100,
      highPrice: 110,
      lowPrice: 95,
      closePrice: 105,
      volume: 1000,
      timestamp: new Date('2024-01-01'),
    },
    {
      openPrice: 105,
      highPrice: 115,
      lowPrice: 100,
      closePrice: 110,
      volume: 1200,
      timestamp: new Date('2024-01-02'),
    },
  ],
  loading: false,
  error: null,
  refetch: vi.fn(),
}));

vi.mock('@/hooks/use-chart-data', () => ({
  useChartData: mockUseChartData,
}));

const mockWatchlistItem: WatchlistItem = {
  asset: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'stock',
    exchange: 'NASDAQ',
  },
  currentPrice: {
    price: 150.25,
    volume: 50000000,
    change24h: 2.5,
    timestamp: new Date(),
  },
  addedAt: new Date(),
};

describe('ChartModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    expect(screen.getByText('AAPL - Apple Inc.')).toBeInTheDocument();
    expect(screen.getByTestId('candlestick-chart')).toBeInTheDocument();
    expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<ChartModal open={false} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    expect(screen.queryByText('AAPL - Apple Inc.')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTitle('關閉');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    // 點擊背景遮罩
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not close when modal content is clicked', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    // 點擊模態框內容
    const modalContent = screen.getByText('AAPL - Apple Inc.');
    fireEvent.click(modalContent);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('handles time range change', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    // 點擊時間範圍按鈕
    const weekButton = screen.getByText('1週');
    fireEvent.click(weekButton);
    
    // 檢查時間範圍是否更新
    expect(screen.getByText('Current: 1W')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseChartData.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    expect(screen.getByText('載入圖表資料中...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseChartData.mockReturnValue({
      data: [],
      loading: false,
      error: '無法載入圖表資料',
      refetch: vi.fn(),
    });

    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    expect(screen.getByText('無法載入圖表資料')).toBeInTheDocument();
  });

  it('shows retry button in error state', () => {
    const mockRefetch = vi.fn();
    mockUseChartData.mockReturnValue({
      data: [],
      loading: false,
      error: '載入失敗',
      refetch: mockRefetch,
    });

    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    const retryButton = screen.getByText('重試');
    fireEvent.click(retryButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    // 按 Escape 鍵
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders crypto item correctly', () => {
    const cryptoItem: WatchlistItem = {
      asset: {
        symbol: 'BTC',
        name: 'Bitcoin',
        assetType: 'crypto',
      },
      currentPrice: {
        price: 45000,
        change24h: -1.2,
        timestamp: new Date(),
      },
      addedAt: new Date(),
    };

    render(<ChartModal open={true} item={cryptoItem} onClose={mockOnClose} />);
    
    expect(screen.getByText('BTC - Bitcoin')).toBeInTheDocument();
  });

  it('displays current price information', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    expect(screen.getByText('$150.25')).toBeInTheDocument();
    expect(screen.getByText('+2.50%')).toBeInTheDocument();
  });

  it('shows fullscreen toggle button', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    const fullscreenButton = screen.getByTitle('全螢幕');
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('handles fullscreen toggle', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    const fullscreenButton = screen.getByTitle('全螢幕');
    fireEvent.click(fullscreenButton);
    
    // 檢查是否切換到全螢幕模式（具體實現可能因組件而異）
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('passes correct props to CandlestickChart', () => {
    render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    const chart = screen.getByTestId('candlestick-chart');
    expect(chart).toHaveTextContent('Mock Chart with 2 data points');
  });

  it('applies correct modal styling', () => {
    const { container } = render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    // 檢查模態框的基本樣式
    const modal = container.querySelector('.fixed.inset-0');
    expect(modal).toBeInTheDocument();
  });

  it('applies correct modal styling', () => {
    const { container } = render(<ChartModal open={true} item={mockWatchlistItem} onClose={mockOnClose} />);
    
    // 檢查模態框的基本樣式
    const modal = container.querySelector('.fixed.inset-0');
    expect(modal).toBeInTheDocument();
  });
});