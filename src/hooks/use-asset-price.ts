import { useQuery } from '@tanstack/react-query';
import { StockDetailsResponse, CryptoDetailsResponse, AssetType } from '@/types';

interface UseAssetPriceOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  gcTime?: number;
}

export function useAssetPrice(
  symbol: string,
  assetType: AssetType,
  options: UseAssetPriceOptions = {}
) {
  const {
    enabled = true,
    refetchInterval = 60 * 1000, // 1分鐘自動刷新
    staleTime = 30 * 1000, // 30秒內認為資料新鮮
    gcTime = 5 * 60 * 1000, // 5分鐘垃圾回收
  } = options;

  return useQuery({
    queryKey: ['asset-price', symbol, assetType],
    queryFn: async (): Promise<StockDetailsResponse | CryptoDetailsResponse> => {
      const endpoint = assetType === 'stock' 
        ? `/api/stocks/${encodeURIComponent(symbol)}`
        : `/api/crypto/${encodeURIComponent(symbol)}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`獲取${assetType === 'stock' ? '股票' : '加密貨幣'}價格失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || `獲取${assetType === 'stock' ? '股票' : '加密貨幣'}價格失敗`);
      }

      return data.data;
    },
    enabled: enabled && symbol.trim().length > 0,
    refetchInterval,
    staleTime,
    gcTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}