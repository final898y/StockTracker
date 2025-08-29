'use client';

import { useState } from 'react';
import { WatchlistManager } from '@/components/watchlist';
import { SearchPage } from '@/components/search';
import { ChartModal } from '@/components/charts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Grid, Flex } from '@/components/layout/ResponsiveLayout';
import { FadeTransition } from '@/components/ui/Transitions';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useChartStore } from '@/stores/chart-store';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { Asset, WatchlistItem, StockSearchResult, CryptoSearchResult } from '@/types';
import { 
  SearchIcon, 
  PlusIcon, 
  BarChart3Icon,
  RefreshCwIcon
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'search'>('watchlist');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isModalOpen, closeModal, openModal } = useChartStore();
  const { addToWatchlist } = useWatchlistStore();

  // 處理查看圖表
  const handleViewChart = (item: WatchlistItem) => {
    openModal(item.asset, '1D');
  };

  // 處理從搜尋頁面查看圖表
  const handleViewChartFromSearch = (asset: Asset) => {
    openModal(asset, '1D');
  };

  // 處理添加到追蹤清單
  const handleAddToWatchlist = async (
    asset: StockSearchResult | CryptoSearchResult, 
    type: 'stock' | 'crypto'
  ) => {
    try {
      const watchlistAsset: Asset = {
        symbol: asset.symbol,
        name: asset.name,
        assetType: type,
        exchange: type === 'stock' ? (asset as StockSearchResult).exchange : undefined,
      };
      
      await addToWatchlist(watchlistAsset);
      
      // 切換到追蹤清單標籤以顯示新添加的項目
      setActiveTab('watchlist');
    } catch (error) {
      console.error('添加到追蹤清單失敗:', error);
    }
  };

  // 處理切換到搜尋頁面
  const handleSwitchToSearch = () => {
    setActiveTab('search');
  };

  // 處理刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 這裡可以添加刷新邏輯
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const dashboardActions = (
    <Flex gap="sm" align="center">
      {/* 標籤切換 */}
      <div className="flex items-center bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
            transition-all duration-200
            ${activeTab === 'watchlist'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <BarChart3Icon className="h-4 w-4" />
          <span>追蹤清單</span>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
            transition-all duration-200
            ${activeTab === 'search'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <SearchIcon className="h-4 w-4" />
          <span>搜尋資產</span>
        </button>
      </div>

      {/* 操作按鈕 */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="btn btn-outline btn-sm"
        title="刷新資料"
      >
        <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      {activeTab === 'watchlist' && (
        <button
          onClick={handleSwitchToSearch}
          className="btn btn-primary btn-sm"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">添加資產</span>
        </button>
      )}
    </Flex>
  );

  return (
    <DashboardLayout
      title={activeTab === 'watchlist' ? '投資組合總覽' : '探索新資產'}
      subtitle={
        activeTab === 'watchlist' 
          ? '追蹤您感興趣的股票和加密貨幣價格變動'
          : '搜尋並添加新的股票或加密貨幣到您的追蹤清單'
      }
      actions={dashboardActions}
    >
      {/* 內容區域 */}
      <FadeTransition show={true} duration="normal">
        {activeTab === 'watchlist' && (
          <WatchlistManager 
            onViewChart={handleViewChart}
            onAddAsset={handleSwitchToSearch}
          />
        )}

        {activeTab === 'search' && (
          <SearchPage 
            onViewChart={handleViewChartFromSearch}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}
      </FadeTransition>

      {/* 圖表模態框 */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </DashboardLayout>
  );
}