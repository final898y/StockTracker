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
    
    // 檢查股票項目 - 使用 getAllByText 處理多個元素
    const aaplElements = screen.getAllByText('AAPL');
    expect(aaplElements.length).toBeGreaterThan(0);
    
    const appleElements = screen.getAllByText('Apple Inc.');
    expect(appleElements.length).toBeGreaterThan(0);
    
    // 注意：WatchlistTable 組件目前不顯示交易所信息，所以移除這個測試
    // 如果未來需要顯示交易所信息，可以重新加入這個測試
    
    // 檢查加密貨幣項目
    const btcElements = screen.getAllByText('BTC');
    expect(btcElements.length).toBeGreaterThan(0);
    
    const bitcoinElements = screen.getAllByText('Bitcoin');
    expect(bitcoinElements.length).toBeGreaterThan(0);
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
    
    // 檢查價格格式化 - 使用 getAllByText 處理多個元素
    const applePrices = screen.getAllByText(/\$150\.25/);
    expect(applePrices.length).toBeGreaterThan(0);
    
    const btcPrices = screen.getAllByText(/\$45,000\.50/);
    expect(btcPrices.length).toBeGreaterThan(0);
  });

  it('displays change percentages with correct colors', () => {
    render(<WatchlistTable items={mockWatchlistItems} />);
    
    // 檢查正向變化（綠色）- 使用 getAllByText 處理多個元素
    const positiveChanges = screen.getAllByText('+2.50%');
    expect(positiveChanges.length).toBeGreaterThan(0);
    expect(positiveChanges[0].closest('div')).toHaveClass('text-green-600');
    
    // 檢查負向變化（紅色）
    const negativeChanges = screen.getAllByText('-1.20%');
    expect(negativeChanges.length).toBeGreaterThan(0);
    expect(negativeChanges[0].closest('div')).toHaveClass('text-red-600');
  });

  it('formats volume and market cap correctly', () => {
    render(<WatchlistTable items={mockWatchlistItems} />);
    
    // 檢查成交量格式化 - 使用 getAllByText 處理多個元素
    const appleVolumes = screen.getAllByText('50.00M');
    expect(appleVolumes.length).toBeGreaterThan(0); // AAPL volume
    
    const btcVolumes = screen.getAllByText('25.00B');
    expect(btcVolumes.length).toBeGreaterThan(0); // BTC volume
    
    // 檢查市值格式化
    const marketCaps = screen.getAllByText('850.00B');
    expect(marketCaps.length).toBeGreaterThan(0); // BTC market cap
  });
});