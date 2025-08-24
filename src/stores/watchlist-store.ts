import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { WatchlistItem, Asset, PriceData } from '@/types';
import { watchlistService } from '@/services';

interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
}

interface WatchlistActions {
  // 基本操作
  addToWatchlist: (asset: Asset) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  loadWatchlist: () => Promise<void>;
  clearWatchlist: () => Promise<void>;
  
  // 價格更新
  updatePrice: (symbol: string, priceData: PriceData) => void;
  updatePrices: (priceUpdates: Record<string, PriceData>) => void;
  
  // 狀態管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 查詢功能
  getWatchlistItem: (symbol: string) => WatchlistItem | undefined;
  isInWatchlist: (symbol: string) => boolean;
  getWatchlistSymbols: () => string[];
}

type WatchlistStore = WatchlistState & WatchlistActions;

export const useWatchlistStore = create<WatchlistStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始狀態
        items: [],
        loading: false,
        error: null,

        // 基本操作
        addToWatchlist: async (asset: Asset) => {
          try {
            set({ loading: true, error: null });
            
            // 檢查是否已存在
            if (get().isInWatchlist(asset.symbol)) {
              throw new Error(`${asset.symbol} 已在追蹤清單中`);
            }

            // 添加到 IndexedDB
            await watchlistService.addToWatchlist(asset);
            
            // 創建新的追蹤項目
            const newItem: WatchlistItem = {
              asset,
              addedAt: new Date(),
            };

            set((state) => ({
              items: [...state.items, newItem],
              loading: false,
            }));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '添加到追蹤清單失敗';
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        removeFromWatchlist: async (symbol: string) => {
          try {
            set({ loading: true, error: null });
            
            // 從 IndexedDB 移除
            await watchlistService.removeFromWatchlist(symbol);
            
            set((state) => ({
              items: state.items.filter(item => item.asset.symbol !== symbol),
              loading: false,
            }));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '從追蹤清單移除失敗';
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        loadWatchlist: async () => {
          try {
            set({ loading: true, error: null });
            
            // 從 IndexedDB 載入
            const watchlistData = await watchlistService.getWatchlist();
            
            // 轉換為 WatchlistItem 格式
            const items: WatchlistItem[] = watchlistData.map(item => ({
              asset: {
                symbol: item.symbol,
                name: item.name,
                assetType: item.assetType,
                exchange: item.exchange,
              },
              addedAt: item.addedAt,
            }));

            set({ items, loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '載入追蹤清單失敗';
            set({ error: errorMessage, loading: false });
          }
        },

        clearWatchlist: async () => {
          try {
            set({ loading: true, error: null });
            
            // 清空 IndexedDB
            await watchlistService.clearWatchlist();
            
            set({ items: [], loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '清空追蹤清單失敗';
            set({ error: errorMessage, loading: false });
          }
        },

        // 價格更新
        updatePrice: (symbol: string, priceData: PriceData) => {
          set((state) => ({
            items: state.items.map(item =>
              item.asset.symbol === symbol
                ? { ...item, currentPrice: priceData }
                : item
            ),
          }));
        },

        updatePrices: (priceUpdates: Record<string, PriceData>) => {
          set((state) => ({
            items: state.items.map(item => {
              const priceData = priceUpdates[item.asset.symbol];
              return priceData
                ? { ...item, currentPrice: priceData }
                : item;
            }),
          }));
        },

        // 狀態管理
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),
        clearError: () => set({ error: null }),

        // 查詢功能
        getWatchlistItem: (symbol: string) => {
          return get().items.find(item => item.asset.symbol === symbol);
        },

        isInWatchlist: (symbol: string) => {
          return get().items.some(item => item.asset.symbol === symbol);
        },

        getWatchlistSymbols: () => {
          return get().items.map(item => item.asset.symbol);
        },
      }),
      {
        name: 'watchlist-store',
        // 只持久化基本數據，不包括 loading 和 error 狀態
        partialize: (state) => ({
          items: state.items.map(item => ({
            asset: item.asset,
            addedAt: item.addedAt,
            // 不持久化 currentPrice，因為價格需要即時更新
          })),
        }),
      }
    ),
    {
      name: 'watchlist-store',
    }
  )
);