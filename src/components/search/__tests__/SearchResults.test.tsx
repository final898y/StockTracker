import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SearchResults } from '../SearchResults';
import { StockSearchResult, CryptoSearchResult } from '@/types';

const mockStockResults: StockSearchResult[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    currency: 'USD',
    type: 'Equity',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    currency: 'USD',
    type: 'Equity',
  },
];

const mockCryptoResults: CryptoSearchResult[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/bitcoin.png',
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/ethereum.png',
  },
];

describe('SearchResults', () => {
  const mockOnAddToWatchlist = vi.fn();
  const mockOnViewChart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(<SearchResults loading={true} />);
    
    expect(screen.getByText('搜尋中...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = '網路連線錯誤';
    render(<SearchResults loading={false} error={errorMessage} />);
    
    expect(screen.getByText(`搜尋時發生錯誤: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders empty state when no results', () => {
    render(<SearchResults loading={false} stockResults={[]} cryptoResults={[]} />);
    
    expect(screen.getByText('找不到相關結果')).toBeInTheDocument();
  });

  it('renders stock results correctly', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={mockStockResults}
        cryptoResults={[]}
      />
    );
    
    // 檢查股票區塊標題
    expect(screen.getByText('股票 (2)')).toBeInTheDocument();
    
    // 檢查股票項目
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getAllByText('NASDAQ • USD')[0]).toBeInTheDocument();
    
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
    expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();
  });

  it('renders crypto results correctly', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={[]}
        cryptoResults={mockCryptoResults}
      />
    );
    
    // 檢查加密貨幣區塊標題
    expect(screen.getByText('加密貨幣 (2)')).toBeInTheDocument();
    
    // 檢查加密貨幣項目
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
  });

  it('renders both stock and crypto results', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={mockStockResults}
        cryptoResults={mockCryptoResults}
      />
    );
    
    expect(screen.getByText('股票 (2)')).toBeInTheDocument();
    expect(screen.getByText('加密貨幣 (2)')).toBeInTheDocument();
    
    // 檢查混合結果
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
  });

  it('calls onAddToWatchlist when add button is clicked for stock', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={mockStockResults}
        cryptoResults={[]}
        onAddToWatchlist={mockOnAddToWatchlist}
      />
    );
    
    const addButtons = screen.getAllByText('加入追蹤');
    fireEvent.click(addButtons[0]);
    
    expect(mockOnAddToWatchlist).toHaveBeenCalledWith(mockStockResults[0], 'stock');
  });

  it('calls onAddToWatchlist when add button is clicked for crypto', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={[]}
        cryptoResults={mockCryptoResults}
        onAddToWatchlist={mockOnAddToWatchlist}
      />
    );
    
    const addButtons = screen.getAllByText('加入追蹤');
    fireEvent.click(addButtons[0]);
    
    expect(mockOnAddToWatchlist).toHaveBeenCalledWith(mockCryptoResults[0], 'crypto');
  });

  it('calls onViewChart when chart button is clicked for stock', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={mockStockResults}
        cryptoResults={[]}
        onViewChart={mockOnViewChart}
      />
    );
    
    const chartButtons = screen.getAllByText('圖表');
    fireEvent.click(chartButtons[0]);
    
    expect(mockOnViewChart).toHaveBeenCalledWith(mockStockResults[0], 'stock');
  });

  it('calls onViewChart when chart button is clicked for crypto', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={[]}
        cryptoResults={mockCryptoResults}
        onViewChart={mockOnViewChart}
      />
    );
    
    const chartButtons = screen.getAllByText('圖表');
    fireEvent.click(chartButtons[0]);
    
    expect(mockOnViewChart).toHaveBeenCalledWith(mockCryptoResults[0], 'crypto');
  });

  it('handles undefined results gracefully', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={undefined}
        cryptoResults={undefined}
      />
    );
    
    expect(screen.getByText('找不到相關結果')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SearchResults 
        loading={false} 
        stockResults={[]}
        cryptoResults={[]}
        className="custom-search-results"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-search-results');
  });

  it('renders crypto images when available', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={[]}
        cryptoResults={mockCryptoResults}
      />
    );
    
    const bitcoinImage = screen.getByAltText('Bitcoin');
    expect(bitcoinImage).toBeInTheDocument();
    expect(bitcoinImage).toHaveAttribute('src', expect.stringContaining('bitcoin.png'));
  });

  it('renders fallback avatar when crypto image is not available', () => {
    const cryptoWithoutImage: CryptoSearchResult[] = [
      {
        id: 'dogecoin',
        symbol: 'doge',
        name: 'Dogecoin',
        image: undefined,
      },
    ];

    render(
      <SearchResults 
        loading={false} 
        stockResults={[]}
        cryptoResults={cryptoWithoutImage}
      />
    );
    
    // 檢查是否有 fallback 頭像
    const fallbackAvatar = document.querySelector('.bg-orange-500');
    expect(fallbackAvatar).toBeInTheDocument();
    expect(fallbackAvatar).toHaveTextContent('D'); // DOGE 的第一個字母
  });

  it('shows correct button titles', () => {
    render(
      <SearchResults 
        loading={false} 
        stockResults={mockStockResults}
        cryptoResults={[]}
        onAddToWatchlist={mockOnAddToWatchlist}
        onViewChart={mockOnViewChart}
      />
    );
    
    const chartButton = screen.getAllByTitle('在彈出視窗中查看圖表')[0];
    expect(chartButton).toBeInTheDocument();
  });
});