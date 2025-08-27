'use client';

import { useState } from 'react';
import { WatchlistManager } from '@/components/watchlist';
import { SearchPage } from '@/components/search';
import { ChartModal } from '@/components/charts';
import { useChartStore } from '@/stores/chart-store';
import { Asset, WatchlistItem } from '@/types';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'search'>('watchlist');
  const { isModalOpen, closeModal, openModal } = useChartStore();

  // 處理查看圖表
  const handleViewChart = (item: WatchlistItem) => {
    openModal(item.asset, '1D');
  };

  // 處理從搜尋頁面查看圖表
  const handleViewChartFromSearch = (asset: Asset) => {
    openModal(asset, '1D');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">股票追蹤儀表板</h1>
            <p className="mt-2 text-gray-600">追蹤您感興趣的股票和加密貨幣價格變動</p>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 標籤導航 */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'watchlist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              我的追蹤清單
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              搜尋股票
            </button>
          </nav>
        </div>

        {/* 標籤內容 */}
        <div className="space-y-6">
          {activeTab === 'watchlist' && (
            <div>
              <WatchlistManager onViewChart={handleViewChart} />
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <SearchPage onViewChart={handleViewChartFromSearch} />
            </div>
          )}
        </div>
      </div>

      {/* 圖表模態框 */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}