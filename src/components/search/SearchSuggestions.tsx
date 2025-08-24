'use client';

import React from 'react';
import { ClockIcon, TrendingUpIcon, XIcon } from 'lucide-react';

interface SearchSuggestionsProps {
  searchHistory: string[];
  popularSearches?: string[];
  onSelectSuggestion: (suggestion: string) => void;
  onRemoveFromHistory?: (query: string) => void;
  onClearHistory?: () => void;
  className?: string;
}

const DEFAULT_POPULAR_SEARCHES = [
  'AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN',
  'BTC', 'ETH', 'BNB', 'ADA', 'SOL'
];

export function SearchSuggestions({
  searchHistory,
  popularSearches = DEFAULT_POPULAR_SEARCHES,
  onSelectSuggestion,
  onRemoveFromHistory,
  onClearHistory,
  className = ""
}: SearchSuggestionsProps) {
  const hasHistory = searchHistory.length > 0;
  const hasPopular = popularSearches.length > 0;

  if (!hasHistory && !hasPopular) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 搜尋歷史 */}
      {hasHistory && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                最近搜尋
              </h3>
            </div>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors"
              >
                清除全部
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query, index) => (
              <div
                key={index}
                className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 
                         rounded-full px-3 py-1.5 text-sm"
              >
                <button
                  onClick={() => onSelectSuggestion(query)}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 
                           dark:hover:text-white transition-colors"
                >
                  {query}
                </button>
                
                {onRemoveFromHistory && (
                  <button
                    onClick={() => onRemoveFromHistory(query)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                             transition-colors ml-1"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 熱門搜尋 */}
      {hasPopular && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUpIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              熱門搜尋
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((query, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(query)}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 
                         hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full px-3 py-1.5 
                         text-sm transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜尋提示 */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>💡 提示：</p>
        <ul className="list-disc list-inside space-y-0.5 ml-4">
          <li>輸入股票代碼（如 AAPL）或公司名稱</li>
          <li>輸入加密貨幣代碼（如 BTC）或名稱</li>
          <li>支援模糊搜尋，不需要完整輸入</li>
        </ul>
      </div>
    </div>
  );
}