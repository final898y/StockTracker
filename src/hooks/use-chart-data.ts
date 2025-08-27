import { useQuery } from '@tanstack/react-query';
import { ChartResponse, TimeframeType, AssetType } from '@/types';

interface UseChartDataOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  gcTime?: number;
}

export function useChartData(
  symbol: string,
  timeframe: TimeframeType,
  assetType: AssetType,
  options: UseChartDataOptions = {}
) {
  const {
    enabled = true,
    refetchInterval = 5 * 60 * 1000, // 5分鐘自動刷新
    staleTime = 2 * 60 * 1000, // 2分鐘內認為資料新鮮
    gcTime = 15 * 60 * 1000, // 15分鐘垃圾回收
  } = options;

  return useQuery({
    queryKey: ['chart-data', symbol, timeframe, assetType],
    queryFn: async (): Promise<ChartResponse> => {
      const response = await fetch(
        `/api/charts/${encodeURIComponent(symbol)}?timeframe=${timeframe}&assetType=${assetType}`
      );
      
      if (!response.ok) {
        throw new Error(`獲取圖表資料失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || '獲取圖表資料失敗');
      }

      return data.data;
    },
    enabled: enabled && symbol.trim().length > 0 && assetType !== undefined,
    refetchInterval,
    staleTime,
    gcTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}