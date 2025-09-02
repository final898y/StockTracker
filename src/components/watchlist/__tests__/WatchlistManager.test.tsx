import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { WatchlistManager } from '../WatchlistManager';
import { WatchlistItem } from '@/types';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { useWatchlistPrices } from '@/hooks/use-watchlist-prices';

// Mock the stores and hooks
const mockRemoveFromWatchlist = vi.fn();
const mockLoadWatchlist = vi.fn();
const mockClearError = vi.fn();
const mockRefetch = vi.fn();

vi.mock('@/stores/watchlist-store', () => ({
  useWatchlistStore: vi.fn(),
}));

vi.mock('@/hooks/use-watchlist-prices', () => ({
  useWatchlistPrices: vi.fn(),
}));

const mockUseWatchlistStore = vi.mocked(useWatchlistStore);
const mockUseWatchlistPrices = vi.mocked(useWatchlistPrices);

// Mock the child components
vi.mock('../WatchlistTable', () => ({
  WatchlistTable: ({ items, loading, onRemoveItem, onViewChart }: any) => (
    <div data-testid="watchlist-table">
      <div>Table View - {items.length} items</div>
      {loading && <div>Loading table...</div>}
      {items.map((item: WatchlistItem) => (
        <div key={item.asset.symbol}>
          <span>{item.asset.symbol}</span>
          <button onClick={() => onRemoveItem(item.asset.symbol)}>Remove {item.asset.symbol}</button>
          <button onClick={() => onViewChart(item)}>Chart {item.asset.symbol}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../PriceCard', () => ({
  PriceCard: ({ item, loading, onRemove, onViewChart, onRefresh }: any) => (
    <div data-testid="price-card">
      <div>{item.asset.symbol} Card</div>
      {loading && <div>Loading card...</div>}
      <button onClick={() => onRemove(item.asset.symbol)}>Remove {item.asset.symbol}</button>
      <button onClick={() => onViewChart(item)}>Chart {item.asset.symbol}</button>
      <button onClick={() => onRefresh()}>Refresh {item.asset.symbol}</button>
    </div>
  ),
}));

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

describe('WatchlistManager', () => {
  const mockOnViewChart = vi.fn();
  const mockOnAddAsset = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchlistStore.mockReturnValue({
      items: [],
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
      addToWatchlist: vi.fn(),
      clearWatchlist: vi.fn(),
      updatePrice: vi.fn(),
      updatePrices: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      getWatchlistItem: vi.fn(),
      isInWatchlist: vi.fn(),
      getWatchlistSymbols: vi.fn(),
    });

    mockUseWatchlistPrices.mockReturnValue({
      isLoading: false,
      hasError: false,
      errors: [],
      refetch: mockRefetch,
    });
  });

  it('renders with empty watchlist', () => {
    render(<WatchlistManager />);
    
    expect(screen.getByText('我的追蹤清單')).toBeInTheDocument();
    expect(screen.getByText('0 個追蹤項目')).toBeInTheDocument();
  });

  it('loads watchlist on mount', () => {
    render(<WatchlistManager />);
    
    expect(mockLoadWatchlist).toHaveBeenCalledTimes(1);
  });

  it('displays watchlist items count', () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    expect(screen.getByText('2 個追蹤項目')).toBeInTheDocument();
  });

  it('renders table view by default', () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    expect(screen.getByTestId('watchlist-table')).toBeInTheDocument();
    expect(screen.getByText('Table View - 2 items')).toBeInTheDocument();
  });

  it('switches to cards view when cards button is clicked', async () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    const cardsButton = screen.getByTitle('卡片檢視');
    await user.click(cardsButton);
    
    expect(screen.getAllByTestId('price-card')).toHaveLength(2);
    expect(screen.getByText('AAPL Card')).toBeInTheDocument();
    expect(screen.getByText('BTC Card')).toBeInTheDocument();
  });

  it('switches back to table view when table button is clicked', async () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    // Switch to cards first
    const cardsButton = screen.getByTitle('卡片檢視');
    await user.click(cardsButton);
    
    // Switch back to table
    const tableButton = screen.getByTitle('表格檢視');
    await user.click(tableButton);
    
    expect(screen.getByTestId('watchlist-table')).toBeInTheDocument();
  });

  it('calls refresh function when refresh button is clicked', async () => {
    render(<WatchlistManager />);
    
    const refreshButton = screen.getByText('重新整理');
    await user.click(refreshButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during refresh', async () => {
    const { useWatchlistPrices } = require('@/hooks/use-watchlist-prices');
    useWatchlistPrices.mockReturnValue({
      isLoading: true,
      hasError: false,
      errors: [],
      refetch: mockRefetch,
    });

    render(<WatchlistManager />);
    
    const refreshButton = screen.getByText('重新整理');
    expect(refreshButton).toBeDisabled();
    
    const refreshIcon = refreshButton.querySelector('.animate-spin');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('displays store error', () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: [],
      loading: false,
      error: '載入追蹤清單失敗',
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    expect(screen.getByText('載入錯誤')).toBeInTheDocument();
    expect(screen.getByText('載入追蹤清單失敗')).toBeInTheDocument();
  });

  it('displays price errors', () => {
    const { useWatchlistPrices } = require('@/hooks/use-watchlist-prices');
    useWatchlistPrices.mockReturnValue({
      isLoading: false,
      hasError: true,
      errors: [
        { symbol: 'AAPL', error: '價格載入失敗' },
        { symbol: 'BTC', error: 'API 限制' },
      ],
      refetch: mockRefetch,
    });

    render(<WatchlistManager />);
    
    expect(screen.getByText('載入錯誤')).toBeInTheDocument();
    expect(screen.getByText('AAPL: 價格載入失敗')).toBeInTheDocument();
    expect(screen.getByText('BTC: API 限制')).toBeInTheDocument();
  });

  it('clears error when close button is clicked', async () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: [],
      loading: false,
      error: '載入追蹤清單失敗',
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    const closeButton = screen.getByText('✕');
    await user.click(closeButton);
    
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveItem when remove button is clicked in table view', async () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    const removeButton = screen.getByText('Remove AAPL');
    await user.click(removeButton);
    
    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith('AAPL');
  });

  it('calls onViewChart when chart button is clicked in table view', async () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager onViewChart={mockOnViewChart} />);
    
    const chartButton = screen.getByText('Chart AAPL');
    await user.click(chartButton);
    
    expect(mockOnViewChart).toHaveBeenCalledWith(mockWatchlistItems[0]);
  });

  it('calls onRemoveItem when remove button is clicked in cards view', async () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    // Switch to cards view
    const cardsButton = screen.getByTitle('卡片檢視');
    await user.click(cardsButton);
    
    const removeButton = screen.getAllByText(/Remove/)[0];
    await user.click(removeButton);
    
    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith('AAPL');
  });

  it('shows add asset button when onAddAsset is provided', () => {
    render(<WatchlistManager onAddAsset={mockOnAddAsset} />);
    
    expect(screen.getByText('添加資產')).toBeInTheDocument();
  });

  it('calls onAddAsset when add asset button is clicked', async () => {
    render(<WatchlistManager onAddAsset={mockOnAddAsset} />);
    
    const addButton = screen.getByText('添加資產');
    await user.click(addButton);
    
    expect(mockOnAddAsset).toHaveBeenCalledTimes(1);
  });

  it('shows empty state with add button in cards view', async () => {
    render(<WatchlistManager onAddAsset={mockOnAddAsset} />);
    
    // Switch to cards view
    const cardsButton = screen.getByTitle('卡片檢視');
    await user.click(cardsButton);
    
    expect(screen.getByText('開始追蹤資產')).toBeInTheDocument();
    expect(screen.getByText('添加您想要追蹤的股票或加密貨幣')).toBeInTheDocument();
    expect(screen.getByText('添加第一個資產')).toBeInTheDocument();
  });

  it('calls onAddAsset when empty state add button is clicked', async () => {
    render(<WatchlistManager onAddAsset={mockOnAddAsset} />);
    
    // Switch to cards view
    const cardsButton = screen.getByTitle('卡片檢視');
    await user.click(cardsButton);
    
    const addFirstAssetButton = screen.getByText('添加第一個資產');
    await user.click(addFirstAssetButton);
    
    expect(mockOnAddAsset).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when store is loading', () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: [],
      loading: true,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    render(<WatchlistManager />);
    
    expect(screen.getByText('載入追蹤清單中...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<WatchlistManager className="custom-watchlist-manager" />);
    
    expect(container.firstChild).toHaveClass('custom-watchlist-manager');
  });

  it('handles remove item error gracefully', async () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: false,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist.mockRejectedValue(new Error('Remove failed')),
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<WatchlistManager />);
    
    const removeButton = screen.getByText('Remove AAPL');
    await user.click(removeButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('移除追蹤項目失敗:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('passes loading state to child components', () => {
    const { useWatchlistStore } = require('@/stores/watchlist-store');
    const { useWatchlistPrices } = require('@/hooks/use-watchlist-prices');
    
    useWatchlistStore.mockReturnValue({
      items: mockWatchlistItems,
      loading: true,
      error: null,
      removeFromWatchlist: mockRemoveFromWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearError: mockClearError,
    });

    useWatchlistPrices.mockReturnValue({
      isLoading: true,
      hasError: false,
      errors: [],
      refetch: mockRefetch,
    });

    render(<WatchlistManager />);
    
    expect(screen.getByText('Loading table...')).toBeInTheDocument();
  });
});