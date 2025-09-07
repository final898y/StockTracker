'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StockSearchResult, CryptoSearchResult } from '@/types';
import { TrendingUpIcon, CoinsIcon, PlusIcon, ExternalLinkIcon, BarChart3Icon } from 'lucide-react';

interface SearchResultsProps {
  stockResults?: StockSearchResult[];
  cryptoResults?: CryptoSearchResult[];
  loading: boolean;
  error?: string;
  onAddToWatchlist?: (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => void;
  onViewChart?: (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => void;
  activeFilter: 'all' | 'stock' | 'crypto';
  className?: string;
}

export function SearchResults({
  stockResults,
  cryptoResults,
  loading,
  error,
  onAddToWatchlist,
  onViewChart,
  activeFilter,
  className = ""
}: SearchResultsProps) {
  // 防護措施：確保 results 不為 undefined
  const safeStockResults = stockResults || [];
  const safeCryptoResults = cryptoResults || [];
  const hasResults = safeStockResults.length > 0 || safeCryptoResults.length > 0;

  const filteredStockResults = activeFilter === 'crypto' ? [] : safeStockResults;
  const filteredCryptoResults = activeFilter === 'stock' ? [] : safeCryptoResults;

  const hasFilteredResults = filteredStockResults.length > 0 || filteredCryptoResults.length > 0;

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

  if (!hasFilteredResults) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            找不到相關結果
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="search-results">
      {/* 股票結果 */}
      {filteredStockResults.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUpIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              股票 ({filteredStockResults.length})
            </h3>
          </div>
          
          <div className="grid gap-3">
            {filteredStockResults.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                         dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/asset/${stock.symbol}?type=stock`}
                    className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg 
                             p-2 -m-2 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center 
                                    justify-center text-white font-medium">
                        {stock.symbol.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white 
                                       group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {stock.symbol}
                          </h4>
                          <ExternalLinkIcon className="h-3 w-3 text-gray-400 opacity-0 
                                                     group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stock.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {stock.exchange} • {stock.currency}
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    {onViewChart && (
                      <button
                        onClick={() => onViewChart(stock, 'stock')}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 
                                 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                 rounded-md transition-colors"
                        title="在彈出視窗中查看圖表"
                      >
                        <BarChart3Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">圖表</span>
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
                        <span className="hidden sm:inline">加入追蹤</span>
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
      {filteredCryptoResults.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4" data-testid="crypto-results-header">
            <CoinsIcon className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              加密貨幣 ({filteredCryptoResults.length})
            </h3>
          </div>
          
          <div className="grid gap-3">
            {filteredCryptoResults.map((crypto) => (
              <div
                key={crypto.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                         dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/asset/${crypto.symbol}?type=crypto`}
                    className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg 
                             p-2 -m-2 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      {crypto.image ? (
                        <Image
                          src={crypto.image}
                          alt={crypto.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center 
                                      justify-center text-white font-medium">
                          {crypto.symbol.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white 
                                       group-hover:text-orange-600 dark:group-hover:text-orange-400">
                            {crypto.symbol.toUpperCase()}
                          </h4>
                          <ExternalLinkIcon className="h-3 w-3 text-gray-400 opacity-0 
                                                     group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {crypto.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    {onViewChart && (
                      <button
                        onClick={() => onViewChart(crypto, 'crypto')}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-orange-600 
                                 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 
                                 rounded-md transition-colors"
                        title="在彈出視窗中查看圖表"
                      >
                        <BarChart3Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">圖表</span>
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
                        <span className="hidden sm:inline">加入追蹤</span>
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