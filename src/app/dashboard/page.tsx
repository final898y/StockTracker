'use client';

import { useState } from 'react';
import { WatchlistManager } from '@/components/watchlist';
import { SearchPage } from '@/components/search';
import { ChartModal } from '@/components/charts';
import { useChartStore } from '@/stores/chart-store';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { Asset, WatchlistItem, StockSearchResult, CryptoSearchResult } from '@/types';
import { 
  TrendingUpIcon, 
  SearchIcon, 
  PlusIcon, 
  BarChart3Icon,
  MenuIcon,
  XIcon
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'search'>('watchlist');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 響應式導航欄 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo 和標題 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  股票追蹤器
                </h1>
                <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                  追蹤您的投資組合
                </p>
              </div>
            </div>

            {/* 桌面版導航 */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors
                    ${activeTab === 'watchlist'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <BarChart3Icon className="h-4 w-4" />
                  <span>追蹤清單</span>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors
                    ${activeTab === 'search'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <SearchIcon className="h-4 w-4" />
                  <span>搜尋資產</span>
                </button>
              </nav>
            </div>

            {/* 行動版選單按鈕 */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* 行動版導航選單 */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('watchlist');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium text-sm transition-colors
                    ${activeTab === 'watchlist'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <BarChart3Icon className="h-5 w-5" />
                  <span>我的追蹤清單</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('search');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium text-sm transition-colors
                    ${activeTab === 'search'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <SearchIcon className="h-5 w-5" />
                  <span>搜尋新資產</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* 主要內容區域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 頁面標題和描述 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'watchlist' ? '投資組合總覽' : '探索新資產'}
              </h2>
              <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {activeTab === 'watchlist' 
                  ? '追蹤您感興趣的股票和加密貨幣價格變動'
                  : '搜尋並添加新的股票或加密貨幣到您的追蹤清單'
                }
              </p>
            </div>

            {/* 快速操作按鈕 */}
            {activeTab === 'watchlist' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleSwitchToSearch}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                           text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">添加資產</span>
                  <span className="sm:hidden">添加</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 內容區域 */}
        <div className="space-y-6">
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
        </div>
      </main>

      {/* 圖表模態框 */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* 底部間距（行動版） */}
      <div className="h-6 md:h-0" />
    </div>
  );
}