'use client';

import React, { useState } from 'react';
import { useUnifiedSearch } from '@/hooks/use-unified-search';
import { useSearchStore } from '@/stores/search-store';
import { StockSearchResult, CryptoSearchResult } from '@/types';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { SearchSuggestions } from './SearchSuggestions';
import { Flex } from '@/components/layout/ResponsiveLayout';

import { Asset } from '@/types';

interface SearchPageProps {
  onAddToWatchlist?: (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => void;
  onViewChart?: (asset: Asset) => void;
  className?: string;
}

export function SearchPage({
  onAddToWatchlist,
  onViewChart,
  className = ""
}: SearchPageProps) {
  const [selectedAsset, setSelectedAsset] = useState<{
    asset: StockSearchResult | CryptoSearchResult;
    type: 'stock' | 'crypto';
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'stock' | 'crypto'>('all');

  const {
    query,
    stockResults,
    cryptoResults,
    loading,
    error,
    searchHistory,
    search,
    hasResults,
  } = useUnifiedSearch();

  const { 
    clearHistory, 
    removeFromHistory 
  } = useSearchStore();

  // 處理搜尋建議選擇
  const handleSelectSuggestion = (suggestion: string) => {
    search(suggestion);
  };

  // 處理資產選擇（從搜尋欄）
  const handleSelectAsset = (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => {
    setSelectedAsset({ asset, type });
    // 可以在這裡添加額外的邏輯，比如顯示詳細資訊
  };

  // 處理加入追蹤清單
  const handleAddToWatchlist = (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => {
    onAddToWatchlist?.(asset, type);
    // 可以在這裡添加成功提示
  };

  // 處理查看圖表
  const handleViewChart = (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => {
    const chartAsset: Asset = {
      symbol: asset.symbol,
      name: asset.name,
      assetType: type,
      exchange: type === 'stock' ? (asset as StockSearchResult).exchange : undefined,
    };
    onViewChart?.(chartAsset);
  };

  const showSuggestions = !query && !hasResults && !loading;
  const showResults = query && (hasResults || loading || error);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 頁面標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          資產搜尋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          搜尋並追蹤您感興趣的股票和加密貨幣
        </p>
      </div>

      {/* 搜尋欄 */}
      <div className="flex justify-center">
        <SearchBar
          onSelectAsset={handleSelectAsset}
          placeholder="搜尋股票代碼或加密貨幣..."
          className="w-full max-w-2xl"
        />
      </div>

      {/* 篩選標籤 */}
      <Flex justify="center" gap="sm" className="mt-4">
        <button
          data-testid="stock-tab"
          onClick={() => setActiveFilter('stock')}
          className={`px-4 py-2 rounded-lg text-sm font-medium
            ${activeFilter === 'stock' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}
          `}
        >
          股票
        </button>
        <button
          data-testid="crypto-tab"
          onClick={() => setActiveFilter('crypto')}
          className={`px-4 py-2 rounded-lg text-sm font-medium
            ${activeFilter === 'crypto' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}
          `}
        >
          加密貨幣
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium
            ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}
          `}
        >
          全部
        </button>
      </Flex>

      {/* 搜尋建議（當沒有查詢時顯示） */}
      {showSuggestions && (
        <div className="max-w-4xl mx-auto">
          <SearchSuggestions
            searchHistory={searchHistory}
            onSelectSuggestion={handleSelectSuggestion}
            onRemoveFromHistory={removeFromHistory}
            onClearHistory={clearHistory}
          />
        </div>
      )}

      {/* 搜尋結果 */}
      {showResults && (
        <div className="max-w-4xl mx-auto">
          <SearchResults
            stockResults={stockResults}
            cryptoResults={cryptoResults}
            loading={loading}
            error={error || undefined}
            onAddToWatchlist={handleAddToWatchlist}
            onViewChart={handleViewChart}
            activeFilter={activeFilter}
          />
        </div>
      )}

      {/* 選中的資產詳情（可選） */}
      {selectedAsset && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 
                         dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  已選擇: {selectedAsset.type === 'stock' 
                    ? (selectedAsset.asset as StockSearchResult).symbol 
                    : (selectedAsset.asset as CryptoSearchResult).symbol.toUpperCase()}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedAsset.asset.name}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddToWatchlist(selectedAsset.asset, selectedAsset.type)}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white 
                           text-sm rounded-md transition-colors"
                >
                  加入追蹤
                </button>
                <button
                  onClick={() => handleViewChart(selectedAsset.asset, selectedAsset.type)}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white 
                           text-sm rounded-md transition-colors"
                >
                  查看圖表
                </button>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 
                           text-sm rounded-md transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 統計資訊 */}
      {hasResults && !loading && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            找到 {(stockResults || []).length} 個股票和 {(cryptoResults || []).length} 個加密貨幣
          </div>
        </div>
      )}
    </div>
  );
}