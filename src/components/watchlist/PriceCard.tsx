'use client';

import React from 'react';
import { WatchlistItem } from '@/types';
import { TrendingUpIcon, TrendingDownIcon, BarChart3Icon, TrashIcon, RefreshCwIcon } from 'lucide-react';

interface PriceCardProps {
  item: WatchlistItem;
  loading?: boolean;
  onRemove?: (symbol: string) => void;
  onViewChart?: (item: WatchlistItem) => void;
  onRefresh?: (symbol: string) => void;
  className?: string;
}

export function PriceCard({
  item,
  loading = false,
  onRemove,
  onViewChart,
  onRefresh,
  className = ""
}: PriceCardProps) {
  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'TWD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toLocaleString();
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `${(marketCap / 1e6).toFixed(2)}M`;
    }
    return marketCap.toLocaleString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '剛剛';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} 分鐘前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} 小時前`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} 天前`;
    }
  };

  const isPositiveChange = item.currentPrice?.change24h ? item.currentPrice.change24h >= 0 : false;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 
                    dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* 標題區域 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white 
                          text-lg font-bold ${
            item.asset.assetType === 'stock' ? 'bg-blue-500' : 'bg-orange-500'
          }`}>
            {item.asset.symbol.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.asset.symbol}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.asset.name}
            </p>
            {item.asset.exchange && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {item.asset.exchange}
              </p>
            )}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={() => onRefresh(item.asset.symbol)}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 
                       transition-colors disabled:opacity-50"
              title="重新整理"
            >
              <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {onViewChart && (
            <button
              onClick={() => onViewChart(item)}
              className="p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 
                       transition-colors"
              title="查看圖表"
            >
              <BarChart3Icon className="h-4 w-4" />
            </button>
          )}
          
          {onRemove && (
            <button
              onClick={() => onRemove(item.asset.symbol)}
              className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                       transition-colors"
              title="移除"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 價格資訊 */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : item.currentPrice ? (
        <div className="space-y-4">
          {/* 主要價格 */}
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(item.currentPrice.price)}
            </div>
            {item.currentPrice.change24h !== undefined && (
              <div className={`flex items-center space-x-1 text-sm ${
                isPositiveChange 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {isPositiveChange ? (
                  <TrendingUpIcon className="h-4 w-4" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4" />
                )}
                <span>
                  {isPositiveChange ? '+' : ''}{item.currentPrice.change24h.toFixed(2)}%
                </span>
                <span className="text-gray-500 dark:text-gray-400">24小時</span>
              </div>
            )}
          </div>

          {/* 詳細資訊 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {item.currentPrice.volume && (
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">成交量</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatVolume(item.currentPrice.volume)}
                </div>
              </div>
            )}
            
            {item.currentPrice.marketCap && (
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">市值</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatMarketCap(item.currentPrice.marketCap)}
                </div>
              </div>
            )}
          </div>

          {/* 更新時間 */}
          {item.currentPrice.timestamp && (
            <div className="text-xs text-gray-400 dark:text-gray-500 border-t 
                          border-gray-200 dark:border-gray-700 pt-3">
              更新時間: {formatTimeAgo(item.currentPrice.timestamp)}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            無法載入價格資料
          </div>
          {onRefresh && (
            <button
              onClick={() => onRefresh(item.asset.symbol)}
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 
                       dark:hover:text-blue-300 transition-colors"
            >
              重試
            </button>
          )}
        </div>
      )}

      {/* 添加時間 */}
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-4 pt-3 
                    border-t border-gray-200 dark:border-gray-700">
        加入時間: {formatTimeAgo(item.addedAt)}
      </div>
    </div>
  );
}