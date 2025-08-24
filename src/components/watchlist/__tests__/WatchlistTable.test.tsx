import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { WatchlistTable } from '../WatchlistTable';
import { WatchlistItem } from '@/types';

const mockWatchlistItems: WatchlistItem[] = [
  {
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
  },
  {
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
      timestamp: new Date(),
    },
    addedAt: new Date(),
  },
];

describe('WatchlistTable', () => {
  it('renders empty state when no items', () => {
    render(<WatchlistTable items={[]} />);
    
    expect(screen.getByText('追蹤清單是空的')).toBeInTheDocument();
    expect(screen.getByText('使用搜尋功能添加您想要追蹤的股票或加密貨幣')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<WatchlistTable items={[]} loading={true} />);
    
    // 檢查是否有載入動畫
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders watchlist items correctly', () => {
    render(<WatchlistTable items={mockWatchlistItems} />);
    
    // 檢查股票項目
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('NASDAQ')).toBeInTheDocument();
    
    // 檢查加密貨幣項目
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });

  it('calls onRemoveItem when remove button is clicked', () => {
    const mockOnRemoveItem = vi.fn();
    
    render(
      <WatchlistTable 
        items={mockWatchlistItems} 
        onRemoveItem={mockOnRemoveItem}
      />
    );
    
    // 找到移除按鈕並點擊
    const removeButtons = screen.getAllByTitle('移除');
    fireEvent.click(removeButtons[0]);
    
    expect(mockOnRemoveItem).toHaveBeenCalledWith('AAPL');
  });

  it('calls onViewChart when chart button is clicked', () => {
    const mockOnViewChart = vi.fn();
    
    render(
      <WatchlistTable 
        items={mockWatchlistItems} 
        onViewChart={mockOnViewChart}
      />
    );
    
    // 找到圖表按鈕並點擊
    const chartButtons = screen.getAllByTitle('查看圖表');
    fireEvent.click(chartButtons[0]);
    
    expect(mockOnViewChart).toHaveBeenCalledWith(mockWatchlistItems[0]);
  });

  it('formats prices correctly', () => {
    render(<WatchlistTable items={mockWatchlistItems} />);
    
    // 檢查價格格式化
    expect(screen.getByText(/\$150\.25/)).toBeInTheDocument();
    expect(screen.getByText(/\$45,000\.50/)).toBeInTheDocument();
  });

  it('displays change percentages with correct colors', () => {
    render(<WatchlistTable items={mockWatchlistItems} />);
    
    // 檢查正向變化（綠色）
    const positiveChange = screen.getByText('+2.50%');
    expect(positiveChange.closest('div')).toHaveClass('text-green-600');
    
    // 檢查負向變化（紅色）
    const negativeChange = screen.getByText('-1.20%');
    expect(negativeChange.closest('div')).toHaveClass('text-red-600');
  });

  it('formats volume and market cap correctly', () => {
    render(<WatchlistTable items={mockWatchlistItems} />);
    
    // 檢查成交量格式化
    expect(screen.getByText('50.00M')).toBeInTheDocument(); // AAPL volume
    expect(screen.getByText('25.00B')).toBeInTheDocument(); // BTC volume
    
    // 檢查市值格式化
    expect(screen.getByText('850.00B')).toBeInTheDocument(); // BTC market cap
  });
});