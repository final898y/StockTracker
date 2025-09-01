import { useQueries } from '@tanstack/react-query';
import { useWatchlistStore } from '@/stores';
import { StockDetailsResponse, CryptoDetailsResponse, PriceData } from '@/types';
import { useEffect, useRef } from 'react';

interface UseWatchlistPricesOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export function useWatchlistPrices(options: UseWatchlistPricesOptions = {}) {
  const {
    enabled = true,
    refetchInterval = 60 * 1000, // 1分鐘
    staleTime = 30 * 1000, // 30秒
  } = options;

  const { items, updatePrices } = useWatchlistStore();
  const updatePricesRef = useRef(updatePrices);
  
  // 保持 updatePrices 引用最新
  useEffect(() => {
    updatePricesRef.current = updatePrices;
  }, [updatePrices]);

  // 為每個追蹤項目創建查詢
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['watchlist-price', item.asset.symbol, item.asset.assetType],
      queryFn: async (): Promise<StockDetailsResponse | CryptoDetailsResponse> => {
        const endpoint = item.asset.assetType === 'stock' 
          ? `/api/stocks/${encodeURIComponent(item.asset.symbol)}`
          : `/api/crypto/${encodeURIComponent(item.asset.symbol)}`;

        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`獲取 ${item.asset.symbol} 價格失敗`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error?.message || `獲取 ${item.asset.symbol} 價格失敗`);
        }

        return data.data;
      },
      enabled: enabled && items.length > 0,
      refetchInterval,
      staleTime,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
    })),
  });

  // 當價格資料更新時，同步到 store
  useEffect(() => {
    const priceUpdates: Record<string, PriceData> = {};
    let hasUpdates = false;

    queries.forEach((query, index) => {
      if (query.data && !query.isError && items[index]) {
        const item = items[index];
        const data = query.data;
        
        let priceData: PriceData;
        
        if (item.asset.assetType === 'stock') {
          const stockData = data as StockDetailsResponse;
          priceData = {
            price: stockData.price,
            volume: stockData.volume,
            change24h: stockData.changePercent,
            timestamp: new Date(stockData.timestamp),
          };
        } else {
          const cryptoData = data as CryptoDetailsResponse;
          priceData = {
            price: cryptoData.current_price,
            volume: cryptoData.total_volume,
            marketCap: cryptoData.market_cap,
            change24h: cryptoData.price_change_percentage_24h,
            timestamp: new Date(cryptoData.last_updated),
          };
        }

        priceUpdates[item.asset.symbol] = priceData;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      updatePricesRef.current(priceUpdates);
    }
  }, [
    // 只依賴查詢結果的序列化版本，避免引用變化
    JSON.stringify(queries.map(q => ({ 
      data: q.data, 
      isError: q.isError,
      dataUpdatedAt: q.dataUpdatedAt 
    }))),
    items.length
  ]);

  // 計算整體狀態
  const isLoading = queries.some(query => query.isLoading);
  const hasError = queries.some(query => query.isError);
  const errors = queries
    .filter(query => query.isError)
    .map((query, index) => ({
      symbol: items[index]?.asset.symbol,
      error: query.error?.message || '未知錯誤',
    }));

  return {
    queries,
    isLoading,
    hasError,
    errors,
    refetch: () => {
      queries.forEach(query => query.refetch());
    },
  };
}