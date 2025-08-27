import { useQuery } from '@tanstack/react-query';
import { CryptoSearchResponse } from '@/types';

interface UseCryptoSearchOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useCryptoSearch(query: string, options: UseCryptoSearchOptions = {}) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5分鐘
    gcTime = 10 * 60 * 1000, // 10分鐘
  } = options;

  return useQuery({
    queryKey: ['crypto-search', query],
    queryFn: async (): Promise<CryptoSearchResponse> => {
      if (!query.trim()) {
        return { results: [] };
      }

      const response = await fetch(`/api/crypto/search?query=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        throw new Error(`搜尋加密貨幣失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || '搜尋加密貨幣失敗');
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