import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StockSearchResult, CryptoSearchResult } from '@/types';

interface SearchState {
  query: string;
  stockResults: StockSearchResult[];
  cryptoResults: CryptoSearchResult[];
  loading: boolean;
  error: string | null;
  searchHistory: string[];
}

interface SearchActions {
  // 搜尋操作
  setQuery: (query: string) => void;
  setStockResults: (results: StockSearchResult[]) => void;
  setCryptoResults: (results: CryptoSearchResult[]) => void;
  clearResults: () => void;
  
  // 狀態管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 搜尋歷史
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  
  // 工具方法
  getAllResults: () => (StockSearchResult | CryptoSearchResult)[];
  hasResults: () => boolean;
  reset: () => void;
}

type SearchStore = SearchState & SearchActions;

const MAX_HISTORY_ITEMS = 10;

export const useSearchStore = create<SearchStore>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      query: '',
      stockResults: [],
      cryptoResults: [],
      loading: false,
      error: null,
      searchHistory: [],

      // 搜尋操作
      setQuery: (query: string) => {
        set({ query: query.trim() });
      },

      setStockResults: (results: StockSearchResult[]) => {
        set({ stockResults: results });
      },

      setCryptoResults: (results: CryptoSearchResult[]) => {
        set({ cryptoResults: results });
      },

      clearResults: () => {
        set({
          stockResults: [],
          cryptoResults: [],
          error: null,
        });
      },

      // 狀態管理
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error }),
      
      clearError: () => set({ error: null }),

      // 搜尋歷史管理
      addToHistory: (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        set((state) => {
          // 移除重複項目
          const filteredHistory = state.searchHistory.filter(
            item => item.toLowerCase() !== trimmedQuery.toLowerCase()
          );
          
          // 添加到開頭並限制數量
          const newHistory = [trimmedQuery, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
          
          return { searchHistory: newHistory };
        });
      },

      clearHistory: () => {
        set({ searchHistory: [] });
      },

      removeFromHistory: (query: string) => {
        set((state) => ({
          searchHistory: state.searchHistory.filter(
            item => item.toLowerCase() !== query.toLowerCase()
          ),
        }));
      },

      // 工具方法
      getAllResults: () => {
        const state = get();
        const stockResults = state.stockResults || [];
        const cryptoResults = state.cryptoResults || [];
        return [
          ...stockResults.map(result => ({ ...result, type: 'stock' as const })),
          ...cryptoResults.map(result => ({ ...result, type: 'crypto' as const })),
        ];
      },

      hasResults: () => {
        const state = get();
        const stockResults = state.stockResults || [];
        const cryptoResults = state.cryptoResults || [];
        return stockResults.length > 0 || cryptoResults.length > 0;
      },

      reset: () => {
        set({
          query: '',
          stockResults: [],
          cryptoResults: [],
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: 'search-store',
    }
  )
);