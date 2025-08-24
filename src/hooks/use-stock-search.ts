import { useQuery } from '@tanstack/react-query';
import { StockSearchResponse } from '@/types';

interface UseStockSearchOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useStockSearch(query: string, options: UseStockSearchOptions = {}) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5分鐘
    gcTime = 10 * 60 * 1000, // 10分鐘
  } = options;

  return useQuery({
    queryKey: ['stock-search', query],
    queryFn: async (): Promise<StockSearchResponse> => {
      if (!query.trim()) {
        return { results: [] };
      }

      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        throw new Error(`搜尋股票失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || '搜尋股票失敗');
      }

      return data.data;
    },
    enabled: enabled && query.trim().length > 0,
    staleTime,
    gcTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}