import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PriceCard } from '../PriceCard';
import { WatchlistItem } from '@/types';

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
    timestamp: new Date('2024-01-01T10:00:00Z'),
  },
  addedAt: new Date('2024-01-01T09:00:00Z'),
};

const mockCryptoItem: WatchlistItem = {
  asset: {
    symbol: 'BTC',
    name: 'Bitcoin',
    assetType: 'crypto',
  },
  currentPrice: {
    price: 45000.50,
    volume: 25000000000,
    marketCap: 850000000000,
    change24h: -1.2,
    timestamp: new Date('2024-01-01T10:00:00Z'),
  },
  addedAt: new Date('2024-01-01T09:00:00Z'),
};

describe('PriceCard', () => {
  const mockOnRemove = vi.fn();
  const mockOnViewChart = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stock item correctly', () => {
    render(<PriceCard item={mockWatchlistItem} />);
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('NASDAQ')).toBeInTheDocument();
    expect(screen.getByText('US$150.25')).toBeInTheDocument();
  });

  it('renders crypto item correctly', () => {
    render(<PriceCard item={mockCryptoItem} />);
    
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('US$45,000.50')).toBeInTheDocument();
  });

  it('displays positive price change with correct styling', () => {
    render(<PriceCard item={mockWatchlistItem} />);
    
    const changeElement = screen.getByText('+2.50%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement.closest('div')).toHaveClass('text-green-600');
  });

  it('displays negative price change with correct styling', () => {
    render(<PriceCard item={mockCryptoItem} />);
    
    const changeElement = screen.getByText('-1.20%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement.closest('div')).toHaveClass('text-red-600');
  });

  it('formats volume correctly', () => {
    render(<PriceCard item={mockWatchlistItem} />);
    
    expect(screen.getByText('50.00M')).toBeInTheDocument();
  });

  it('formats market cap correctly', () => {
    render(<PriceCard item={mockCryptoItem} />);
    
    expect(screen.getByText('850.00B')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<PriceCard item={mockWatchlistItem} loading={true} />);
    
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('calls onRemove when remove button is clicked', () => {
    render(<PriceCard item={mockWatchlistItem} onRemove={mockOnRemove} />);
    
    const removeButton = screen.getByTitle('移除');
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith('AAPL');
  });

  it('calls onViewChart when chart button is clicked', () => {
    render(<PriceCard item={mockWatchlistItem} onViewChart={mockOnViewChart} />);
    
    const chartButton = screen.getByTitle('查看圖表');
    fireEvent.click(chartButton);
    
    expect(mockOnViewChart).toHaveBeenCalledWith(mockWatchlistItem);
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<PriceCard item={mockWatchlistItem} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByTitle('重新整理');
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalledWith('AAPL');
  });

  it('shows spinning icon when loading and refresh button clicked', () => {
    render(<PriceCard item={mockWatchlistItem} loading={true} onRefresh={mockOnRefresh} />);
    
    const refreshIcon = document.querySelector('.animate-spin');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('disables refresh button when loading', () => {
    render(<PriceCard item={mockWatchlistItem} loading={true} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByTitle('重新整理');
    expect(refreshButton).toBeDisabled();
  });

  it('renders without price data', () => {
    const itemWithoutPrice: WatchlistItem = {
      ...mockWatchlistItem,
      currentPrice: undefined,
    };

    render(<PriceCard item={itemWithoutPrice} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('無法載入價格資料')).toBeInTheDocument();
    expect(screen.getByText('重試')).toBeInTheDocument();
  });

  it('calls onRefresh when retry button is clicked', () => {
    const itemWithoutPrice: WatchlistItem = {
      ...mockWatchlistItem,
      currentPrice: undefined,
    };

    render(<PriceCard item={itemWithoutPrice} onRefresh={mockOnRefresh} />);
    
    const retryButton = screen.getByText('重試');
    fireEvent.click(retryButton);
    
    expect(mockOnRefresh).toHaveBeenCalledWith('AAPL');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PriceCard item={mockWatchlistItem} className="custom-price-card" />
    );
    
    expect(container.firstChild).toHaveClass('custom-price-card');
  });

  it('shows correct asset type styling', () => {
    // 測試股票樣式
    const { rerender } = render(<PriceCard item={mockWatchlistItem} />);
    let avatar = document.querySelector('.bg-blue-500');
    expect(avatar).toBeInTheDocument();
    
    // 測試加密貨幣樣式
    rerender(<PriceCard item={mockCryptoItem} />);
    avatar = document.querySelector('.bg-orange-500');
    expect(avatar).toBeInTheDocument();
  });

  it('formats time ago correctly', () => {
    // 使用較舊的時間戳來測試時間格式化
    const oldItem: WatchlistItem = {
      ...mockWatchlistItem,
      currentPrice: {
        ...mockWatchlistItem.currentPrice!,
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2分鐘前
      },
      addedAt: new Date(Date.now() - 60 * 60 * 1000), // 1小時前
    };

    render(<PriceCard item={oldItem} />);
    
    // 檢查是否有時間顯示（具體格式可能因實際時間而異）
    expect(screen.getByText(/更新時間:/)).toBeInTheDocument();
    expect(screen.getByText(/加入時間:/)).toBeInTheDocument();
  });

  it('handles zero change correctly', () => {
    const itemWithZeroChange: WatchlistItem = {
      ...mockWatchlistItem,
      currentPrice: {
        ...mockWatchlistItem.currentPrice!,
        change24h: 0,
      },
    };

    render(<PriceCard item={itemWithZeroChange} />);
    
    const changeElement = screen.getByText('0.00%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement.closest('div')).toHaveClass('text-red-600'); // Zero is treated as negative in the component
  });

  it('handles missing change data', () => {
    const itemWithoutChange: WatchlistItem = {
      ...mockWatchlistItem,
      currentPrice: {
        price: 150.25,
        volume: 50000000,
        timestamp: new Date(),
        // change24h 未定義
      },
    };

    render(<PriceCard item={itemWithoutChange} />);
    
    // 應該不顯示變化百分比
    expect(screen.queryByText(/\+.*%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/-.*%/)).not.toBeInTheDocument();
  });

  it('handles missing volume and market cap', () => {
    const itemWithMinimalData: WatchlistItem = {
      ...mockWatchlistItem,
      currentPrice: {
        price: 150.25,
        timestamp: new Date(),
        // volume 和 marketCap 未定義
      },
    };

    render(<PriceCard item={itemWithMinimalData} />);
    
    // 應該不顯示成交量和市值
    expect(screen.queryByText('成交量')).not.toBeInTheDocument();
    expect(screen.queryByText('市值')).not.toBeInTheDocument();
  });
});