import { WatchlistItem, Asset, PriceData, StockSearchResult, CryptoSearchResult, CandlestickData, TimeframeType } from '@/types';

// Watchlist Store Types
export interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
}

export interface WatchlistActions {
  addToWatchlist: (asset: Asset) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  loadWatchlist: () => Promise<void>;
  clearWatchlist: () => Promise<void>;
  updatePrice: (symbol: string, priceData: PriceData) => void;
  updatePrices: (priceUpdates: Record<string, PriceData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getWatchlistItem: (symbol: string) => WatchlistItem | undefined;
  isInWatchlist: (symbol: string) => boolean;
  getWatchlistSymbols: () => string[];
}

export type WatchlistStore = WatchlistState & WatchlistActions;

// Search Store Types
export interface SearchState {
  query: string;
  stockResults: StockSearchResult[];
  cryptoResults: CryptoSearchResult[];
  loading: boolean;
  error: string | null;
  searchHistory: string[];
}

export interface SearchActions {
  setQuery: (query: string) => void;
  setStockResults: (results: StockSearchResult[]) => void;
  setCryptoResults: (results: CryptoSearchResult[]) => void;
  clearResults: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  getAllResults: () => (StockSearchResult | CryptoSearchResult)[];
  hasResults: () => boolean;
  reset: () => void;
}

export type SearchStore = SearchState & SearchActions;

// Chart Store Types
export interface ChartState {
  currentAsset: Asset | null;
  timeframe: TimeframeType;
  data: CandlestickData[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  isFullscreen: boolean;
  lastUpdated: Date | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface ChartActions {
  setCurrentAsset: (asset: Asset | null) => void;
  setTimeframe: (timeframe: TimeframeType) => void;
  setData: (data: CandlestickData[]) => void;
  clearData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  openModal: (asset: Asset, timeframe?: TimeframeType) => void;
  closeModal: () => void;
  toggleFullscreen: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  updateLastRefresh: () => void;
  hasData: () => boolean;
  isDataStale: (maxAge?: number) => boolean;
  reset: () => void;
}

export type ChartStore = ChartState & ChartActions;