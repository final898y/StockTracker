'use client';

import { useEffect } from 'react';
import { ResponsiveChart } from './ResponsiveChart';
import { ChartLoading } from './ChartLoading';
import { ChartError } from './ChartError';
import { useChartData } from '@/hooks/use-chart-data';
import { useChartStore } from '@/stores/chart-store';
import { Asset, TimeframeType } from '@/types';

interface ChartContainerProps {
  asset: Asset;
  timeframe?: TimeframeType;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export function ChartContainer({
  asset,
  timeframe = '1D',
  className = '',
  minHeight = 300,
  maxHeight = 600,
  aspectRatio = 2,
}: ChartContainerProps) {
  const { setCurrentAsset, setTimeframe, setData, setLoading, setError } = useChartStore();

  // 使用 React Query 獲取圖表資料
  const {
    data: chartResponse,
    isLoading,
    error,
    refetch,
  } = useChartData(asset.symbol, timeframe, {
    enabled: !!asset.symbol,
    refetchInterval: 5 * 60 * 1000, // 5分鐘自動刷新
  });

  // 同步狀態到 store
  useEffect(() => {
    setCurrentAsset(asset);
    setTimeframe(timeframe);
  }, [asset, timeframe, setCurrentAsset, setTimeframe]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    } else {
      setError(null);
    }
  }, [error, setError]);

  useEffect(() => {
    if (chartResponse?.data) {
      // 轉換 API 資料格式為內部格式
      const candlesticks = chartResponse.data.map(point => ({
        openPrice: point.open,
        highPrice: point.high,
        lowPrice: point.low,
        closePrice: point.close,
        volume: point.volume,
        timestamp: new Date(point.timestamp * 1000),
      }));
      
      setData(candlesticks);
    }
  }, [chartResponse, setData]);

  const handleRetry = () => {
    refetch();
  };

  // 載入狀態
  if (isLoading) {
    return (
      <ChartLoading 
        className={className}
        height={minHeight}
      />
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <ChartError
        error={error.message}
        className={className}
        height={minHeight}
        onRetry={handleRetry}
      />
    );
  }

  // 無資料狀態
  if (!chartResponse?.data || chartResponse.data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ height: minHeight }}
      >
        <div className="text-center p-6">
          <p className="text-gray-600">暫無圖表資料</p>
          <p className="text-sm text-gray-500 mt-2">
            {asset.name} ({asset.symbol}) - {timeframe}
          </p>
        </div>
      </div>
    );
  }

  // 轉換資料格式
  const candlesticks = chartResponse.data.map(point => ({
    openPrice: point.open,
    highPrice: point.high,
    lowPrice: point.low,
    closePrice: point.close,
    volume: point.volume,
    timestamp: new Date(point.timestamp * 1000),
  }));

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {asset.name} ({asset.symbol})
        </h3>
        <p className="text-sm text-gray-600">時間範圍: {timeframe}</p>
      </div>
      
      <ResponsiveChart
        data={candlesticks}
        minHeight={minHeight}
        maxHeight={maxHeight}
        aspectRatio={aspectRatio}
        className="border border-gray-200 rounded-lg"
      />
    </div>
  );
}