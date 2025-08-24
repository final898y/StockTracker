'use client';

import React from 'react';
import { StockSearchResult, CryptoSearchResult } from '@/types';
import { TrendingUpIcon, CoinsIcon, PlusIcon } from 'lucide-react';

interface SearchResultsProps {
  stockResults: StockSearchResult[];
  cryptoResults: CryptoSearchResult[];
  loading: boolean;
  error?: string;
  onAddToWatchlist?: (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => void;
  onViewChart?: (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => void;
  className?: string;
}

export function SearchResults({
  stockResults,
  cryptoResults,
  loading,
  error,
  onAddToWatchlist,
  onViewChart,
  className = ""
}: SearchResultsProps) {
  const hasResults = stockResults.length > 0 || cryptoResults.length > 0;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">搜尋中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400">
            搜尋時發生錯誤: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            請使用上方搜尋框搜尋股票或加密貨幣
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 股票結果 */}
      {stockResults.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUpIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              股票 ({stockResults.length})
            </h3>
          </div>
          
          <div className="grid gap-3">
            {stockResults.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                         dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {stock.symbol}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stock.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {stock.exchange} • {stock.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {onViewChart && (
                      <button
                        onClick={() => onViewChart(stock, 'stock')}
                        className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 
                                 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md
                                 transition-colors"
                      >
                        查看圖表
                      </button>
                    )}
                    
                    {onAddToWatchlist && (
                      <button
                        onClick={() => onAddToWatchlist(stock, 'stock')}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm 
                                 bg-blue-500 hover:bg-blue-600 text-white rounded-md
                                 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>加入追蹤</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 加密貨幣結果 */}
      {cryptoResults.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <CoinsIcon className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              加密貨幣 ({cryptoResults.length})
            </h3>
          </div>
          
          <div className="grid gap-3">
            {cryptoResults.map((crypto) => (
              <div
                key={crypto.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                         dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {crypto.image && (
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {crypto.symbol.toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {crypto.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {onViewChart && (
                      <button
                        onClick={() => onViewChart(crypto, 'crypto')}
                        className="px-3 py-1.5 text-sm text-orange-600 dark:text-orange-400 
                                 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md
                                 transition-colors"
                      >
                        查看圖表
                      </button>
                    )}
                    
                    {onAddToWatchlist && (
                      <button
                        onClick={() => onAddToWatchlist(crypto, 'crypto')}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm 
                                 bg-orange-500 hover:bg-orange-600 text-white rounded-md
                                 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>加入追蹤</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}