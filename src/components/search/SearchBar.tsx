'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useUnifiedSearch } from '@/hooks/use-unified-search';
import { StockSearchResult, CryptoSearchResult } from '@/types';
import { SearchIcon, XIcon, ClockIcon } from 'lucide-react';

interface SearchBarProps {
  onSelectAsset?: (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onSelectAsset, 
  placeholder = "搜尋股票或加密貨幣...",
  className = ""
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    query,
    stockResults,
    cryptoResults,
    loading,
    error,
    searchHistory,
    search,
    clear,
    hasResults,
    stockCount,
    cryptoCount,
  } = useUnifiedSearch({
    enabled: true,
    debounceMs: 300,
    minQueryLength: 1,
  });

  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    search(value);
    setIsOpen(true);
  };

  // 處理資產選擇
  const handleSelectAsset = (asset: StockSearchResult | CryptoSearchResult, type: 'stock' | 'crypto') => {
    onSelectAsset?.(asset, type);
    setInputValue('');
    setIsOpen(false);
    clear();
  };

  // 處理歷史記錄選擇
  const handleSelectHistory = (historyQuery: string) => {
    setInputValue(historyQuery);
    search(historyQuery);
    inputRef.current?.focus();
  };

  // 清空搜尋
  const handleClear = () => {
    setInputValue('');
    clear();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // 處理點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 處理鍵盤事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = isOpen && (hasResults || searchHistory.length > 0 || loading || error);

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      {/* 搜尋輸入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          data-testid="search-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   dark:bg-gray-800 dark:border-gray-600 dark:text-white
                   dark:placeholder-gray-400 dark:focus:ring-blue-400"
        />
        
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* 搜尋結果下拉選單 */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
                   max-h-96 overflow-y-auto"
        >
          {/* 載入狀態 */}
          {loading && (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>搜尋中...</span>
              </div>
            </div>
          )}

          {/* 錯誤狀態 */}
          {error && !loading && (
            <div className="px-4 py-3 text-center text-red-500 dark:text-red-400">
              搜尋時發生錯誤: {error}
            </div>
          )}

          {/* 搜尋結果 */}
          {!loading && !error && hasResults && (
            <>
              {/* 股票結果 */}
              {stockCount > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 
                               bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    股票 ({stockCount})
                  </div>
                  {stockResults.map((stock) => (
                    <button
                      key={`stock-${stock.symbol}`}
                      onClick={() => handleSelectAsset(stock, 'stock')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                               border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {stock.exchange}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 加密貨幣結果 */}
              {cryptoCount > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 
                               bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    加密貨幣 ({cryptoCount})
                  </div>
                  {cryptoResults.map((crypto) => (
                    <button
                      key={`crypto-${crypto.id}`}
                      onClick={() => handleSelectAsset(crypto, 'crypto')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                               border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {crypto.image && (
                            <Image
                              src={crypto.image}
                              alt={crypto.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {crypto.symbol.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {crypto.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 搜尋歷史 */}
          {!loading && !error && !hasResults && searchHistory.length > 0 && !query && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 
                           bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                最近搜尋
              </div>
              {searchHistory.map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectHistory(historyItem)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                           border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{historyItem}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 無結果 */}
          {!loading && !error && !hasResults && query && (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              找不到相關結果
            </div>
          )}
        </div>
      )}
    </div>
  );
}