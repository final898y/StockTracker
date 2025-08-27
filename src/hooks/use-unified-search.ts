import { useCallback, useEffect } from 'react';
import { useSearchStore } from '@/stores';
import { useStockSearch } from './use-stock-search';
import { useCryptoSearch } from './use-crypto-search';

interface UseUnifiedSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
}

export function useUnifiedSearch(options: UseUnifiedSearchOptions = {}) {
  const {
    enabled = true,
    debounceMs = 300,
    minQueryLength = 1,
  } = options;

  const {
    query,
    stockResults,
    cryptoResults,
    loading,
    error,
    searchHistory,
    setQuery,
    setStockResults,
    setCryptoResults,
    setLoading,
    setError,
    clearError,
    clearResults,
    addToHistory,
    getAllResults,
    hasResults,
    reset,
  } = useSearchStore();

  // 判斷是否應該執行搜尋
  const shouldSearch = enabled && query.length >= minQueryLength;

  // 股票搜尋
  const stockQuery = useStockSearch(query, {
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000,
  });

  // 加密貨幣搜尋
  const cryptoQuery = useCryptoSearch(query, {
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000,
  });

  // 同步載入狀態
  useEffect(() => {
    const isLoading = stockQuery.isLoading || cryptoQuery.isLoading;
    setLoading(isLoading);
  }, [stockQuery.isLoading, cryptoQuery.isLoading, setLoading]);

  // 同步錯誤狀態
  useEffect(() => {
    const stockError = stockQuery.error?.message;
    const cryptoError = cryptoQuery.error?.message;
    
    if (stockError || cryptoError) {
      const errorMessage = [stockError, cryptoError].filter(Boolean).join('; ');
      setError(errorMessage);
    } else {
      clearError();
    }
  }, [stockQuery.error, cryptoQuery.error, setError, clearError]);

  // 同步搜尋結果
  useEffect(() => {
    if (stockQuery.data) {
      setStockResults(stockQuery.data.results);
    }
  }, [stockQuery.data, setStockResults]);

  useEffect(() => {
    if (cryptoQuery.data) {
      setCryptoResults(cryptoQuery.data.results);
    }
  }, [cryptoQuery.data, setCryptoResults]);

  // 搜尋方法
  const search = useCallback((searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    setQuery(trimmedQuery);
    
    if (trimmedQuery) {
      addToHistory(trimmedQuery);
    } else {
      clearResults();
    }
  }, [setQuery, addToHistory, clearResults]);

  // 重新搜尋
  const refetch = useCallback(async () => {
    if (shouldSearch) {
      clearError();
      await Promise.all([
        stockQuery.refetch(),
        cryptoQuery.refetch(),
      ]);
    }
  }, [shouldSearch, stockQuery, cryptoQuery, clearError]);

  // 清空搜尋
  const clear = useCallback(() => {
    reset();
  }, [reset]);

  return {
    // 狀態
    query,
    stockResults,
    cryptoResults,
    allResults: getAllResults(),
    loading,
    error,
    searchHistory,
    hasResults: hasResults(),
    
    // 方法
    search,
    refetch,
    clear,
    setQuery,
    
    // 統計
    totalResults: (stockResults || []).length + (cryptoResults || []).length,
    stockCount: (stockResults || []).length,
    cryptoCount: (cryptoResults || []).length,
    
    // 查詢狀態
    isStockLoading: stockQuery.isLoading,
    isCryptoLoading: cryptoQuery.isLoading,
    stockError: stockQuery.error?.message,
    cryptoError: cryptoQuery.error?.message,
  };
}