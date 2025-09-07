'use client';

import React, { useEffect, useState } from 'react';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { useWatchlistPrices } from '@/hooks/use-watchlist-prices';
import { WatchlistItem } from '@/types';
import { WatchlistTable } from './WatchlistTable';
import { PriceCard } from './PriceCard';
import { RefreshCwIcon, GridIcon, ListIcon, PlusIcon } from 'lucide-react';

interface WatchlistManagerProps {
  onViewChart?: (item: WatchlistItem) => void;
  onAddAsset?: () => void;
  className?: string;
}

type ViewMode = 'table' | 'cards';

export function WatchlistManager({
  onViewChart,
  onAddAsset,
  className = ""
}: WatchlistManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [refreshing, setRefreshing] = useState(false);

  const {
    items,
    loading: storeLoading,
    error: storeError,
    removeFromWatchlist,
    loadWatchlist,
    clearError,
  } = useWatchlistStore();

  const {
    isLoading: pricesLoading,
    hasError: pricesError,
    errors: priceErrors,
    refetch: refetchPrices,
  } = useWatchlistPrices({
    enabled: items.length > 0,
    refetchInterval: 60 * 1000, // 1分鐘
  });

  // 載入追蹤清單
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // 處理移除項目
  const handleRemoveItem = async (symbol: string) => {
    try {
      await removeFromWatchlist(symbol);
    } catch (error) {
      console.error('移除追蹤項目失敗:', error);
    }
  };

  // 處理重新整理
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchPrices();
    } finally {
      setRefreshing(false);
    }
  };

  // 處理單個項目重新整理
  const handleRefreshItem = async () => {
    // 這裡可以實作單個項目的重新整理邏輯
    await handleRefresh();
  };

  const isLoading = storeLoading || pricesLoading || refreshing;
  const hasError = storeError || pricesError;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 標題和控制項 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            我的追蹤清單
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {items.length} 個追蹤項目
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* 重新整理按鈕 */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 
                     hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-lg transition-colors
                     disabled:opacity-50"
            title="重新整理價格"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>

          {/* 檢視模式切換 */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="表格檢視"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="卡片檢視"
            >
              <GridIcon className="h-4 w-4" />
            </button>
          </div>

          {/* 添加按鈕 */}
          {onAddAsset && (
            <button
              onClick={onAddAsset}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                       text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>添加資產</span>
            </button>
          )}
        </div>
      </div>

      {/* 錯誤訊息 */}
      {hasError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                      rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                載入錯誤
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                {storeError && <p>{storeError}</p>}
                {priceErrors.length > 0 && (
                  <ul className="list-disc list-inside">
                    {priceErrors.map((error, index) => (
                      <li key={index}>{error.symbol}: {error.error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 dark:text-red-400 
                       dark:hover:text-red-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 追蹤清單內容 */}
      {viewMode === 'table' ? (
        <WatchlistTable
          items={items}
          loading={isLoading}
          onRemoveItem={handleRemoveItem}
          onViewChart={onViewChart}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <PriceCard
              key={item.asset.symbol}
              item={item}
              loading={isLoading}
              onRemove={handleRemoveItem}
              onViewChart={onViewChart}
              onRefresh={handleRefreshItem}
            />
          ))}
          
          {/* 空狀態時的添加卡片 */}
          {items.length === 0 && !isLoading && onAddAsset && (
            <div className="col-span-full">
              <div className="text-center py-12" data-testid="empty-watchlist">
                <div className="text-gray-500 dark:text-gray-400">
                  <PlusIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">開始追蹤資產</h3>
                  <p className="text-sm mb-4">添加您想要追蹤的股票或加密貨幣</p>
                  <button
                    onClick={onAddAsset}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 
                             hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>添加第一個資產</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 載入狀態 */}
      {isLoading && items.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCwIcon className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">載入追蹤清單中...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 導出輔助函數供外部使用
export { WatchlistManager as default };
export type { WatchlistManagerProps };