'use client';

import React from 'react';
import { WatchlistItem } from '@/types';
import { TrendingUpIcon, TrendingDownIcon, TrashIcon, BarChart3Icon } from 'lucide-react';

interface WatchlistTableProps {
  items: WatchlistItem[];
  loading?: boolean;
  onRemoveItem?: (symbol: string) => void;
  onViewChart?: (item: WatchlistItem) => void;
  className?: string;
}

export function WatchlistTable({
  items,
  loading = false,
  onRemoveItem,
  onViewChart,
  className = ""
}: WatchlistTableProps) {
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

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center space-x-1 ${
        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {isPositive ? (
          <TrendingUpIcon className="h-4 w-4" />
        ) : (
          <TrendingDownIcon className="h-4 w-4" />
        )}
        <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-12 rounded-lg mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 h-16 rounded-lg mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">
          <BarChart3Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">追蹤清單是空的</h3>
          <p className="text-sm">使用搜尋功能添加您想要追蹤的股票或加密貨幣</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* 桌面版表格 */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  資產
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  價格
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  24小時變化
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  成交量
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  市值
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr
                  key={item.asset.symbol}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        item.asset.assetType === 'stock' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}>
                        {item.asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.asset.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.asset.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {item.currentPrice ? (
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.currentPrice.price)}
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">載入中...</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {item.currentPrice?.change24h !== undefined ? (
                      formatChange(item.currentPrice.change24h)
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                    {item.currentPrice?.volume ? (
                      formatVolume(item.currentPrice.volume)
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                    {item.currentPrice?.marketCap ? (
                      formatMarketCap(item.currentPrice.marketCap)
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {onViewChart && (
                        <button
                          onClick={() => onViewChart(item)}
                          className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 
                                   transition-colors"
                          title="查看圖表"
                        >
                          <BarChart3Icon className="h-4 w-4" />
                        </button>
                      )}
                      {onRemoveItem && (
                        <button
                          onClick={() => onRemoveItem(item.asset.symbol)}
                          className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                                   transition-colors"
                          title="移除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 行動版卡片 */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div
            key={item.asset.symbol}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  item.asset.assetType === 'stock' ? 'bg-blue-500' : 'bg-orange-500'
                }`}>
                  {item.asset.symbol.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.asset.symbol}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.asset.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onViewChart && (
                  <button
                    onClick={() => onViewChart(item)}
                    className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 
                             transition-colors"
                  >
                    <BarChart3Icon className="h-5 w-5" />
                  </button>
                )}
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.asset.symbol)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                             transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {item.currentPrice ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">價格</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(item.currentPrice.price)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">24小時變化</div>
                  {item.currentPrice.change24h !== undefined ? (
                    formatChange(item.currentPrice.change24h)
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500">-</div>
                  )}
                </div>
                {item.currentPrice.volume && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">成交量</div>
                    <div className="text-gray-900 dark:text-white">
                      {formatVolume(item.currentPrice.volume)}
                    </div>
                  </div>
                )}
                {item.currentPrice.marketCap && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">市值</div>
                    <div className="text-gray-900 dark:text-white">
                      {formatMarketCap(item.currentPrice.marketCap)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 dark:text-gray-500">
                載入價格資料中...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}