import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CandlestickData, TimeframeType, Asset } from '@/types';

interface ChartState {
  // 當前圖表資料
  currentAsset: Asset | null;
  timeframe: TimeframeType;
  data: CandlestickData[];
  loading: boolean;
  error: string | null;
  
  // 圖表顯示狀態
  isModalOpen: boolean;
  isFullscreen: boolean;
  
  // 快取管理
  lastUpdated: Date | null;
  autoRefresh: boolean;
  refreshInterval: number; // 毫秒
}

interface ChartActions {
  // 圖表資料管理
  setCurrentAsset: (asset: Asset | null) => void;
  setTimeframe: (timeframe: TimeframeType) => void;
  setData: (data: CandlestickData[]) => void;
  clearData: () => void;
  
  // 狀態管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 圖表顯示控制
  openModal: (asset: Asset, timeframe?: TimeframeType) => void;
  closeModal: () => void;
  toggleFullscreen: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  
  // 自動刷新控制
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  updateLastRefresh: () => void;
  
  // 工具方法
  hasData: () => boolean;
  isDataStale: (maxAge?: number) => boolean;
  reset: () => void;
}

type ChartStore = ChartState & ChartActions;

const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000; // 5分鐘
const DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5分鐘

export const useChartStore = create<ChartStore>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      currentAsset: null,
      timeframe: '1D',
      data: [],
      loading: false,
      error: null,
      isModalOpen: false,
      isFullscreen: false,
      lastUpdated: null,
      autoRefresh: true,
      refreshInterval: DEFAULT_REFRESH_INTERVAL,

      // 圖表資料管理
      setCurrentAsset: (asset: Asset | null) => {
        set({ currentAsset: asset });
        if (!asset) {
          get().clearData();
        }
      },

      setTimeframe: (timeframe: TimeframeType) => {
        set({ timeframe });
        // 切換時間範圍時清空現有資料，強制重新載入
        get().clearData();
      },

      setData: (data: CandlestickData[]) => {
        set({
          data: [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
          lastUpdated: new Date(),
          error: null,
        });
      },

      clearData: () => {
        set({
          data: [],
          lastUpdated: null,
          error: null,
        });
      },

      // 狀態管理
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error }),
      
      clearError: () => set({ error: null }),

      // 圖表顯示控制
      openModal: (asset: Asset, timeframe: TimeframeType = '1D') => {
        set({
          currentAsset: asset,
          timeframe,
          isModalOpen: true,
          isFullscreen: false,
        });
      },

      closeModal: () => {
        set({
          isModalOpen: false,
          isFullscreen: false,
        });
      },

      toggleFullscreen: () => {
        set((state) => ({
          isFullscreen: !state.isFullscreen,
        }));
      },

      setFullscreen: (fullscreen: boolean) => {
        set({ isFullscreen: fullscreen });
      },

      // 自動刷新控制
      setAutoRefresh: (enabled: boolean) => {
        set({ autoRefresh: enabled });
      },

      setRefreshInterval: (interval: number) => {
        if (interval < 1000) {
          console.warn('刷新間隔不能小於1秒');
          return;
        }
        set({ refreshInterval: interval });
      },

      updateLastRefresh: () => {
        set({ lastUpdated: new Date() });
      },

      // 工具方法
      hasData: () => {
        return get().data.length > 0;
      },

      isDataStale: (maxAge: number = DEFAULT_MAX_AGE) => {
        const { lastUpdated } = get();
        if (!lastUpdated) return true;
        
        const now = new Date().getTime();
        const dataAge = now - lastUpdated.getTime();
        return dataAge > maxAge;
      },

      reset: () => {
        set({
          currentAsset: null,
          timeframe: '1D',
          data: [],
          loading: false,
          error: null,
          isModalOpen: false,
          isFullscreen: false,
          lastUpdated: null,
        });
      },
    }),
    {
      name: 'chart-store',
    }
  )
);