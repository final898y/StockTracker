'use client';

import { useEffect, useState } from 'react';
import { InteractiveChart } from './InteractiveChart';
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
  timeframe: initialTimeframe = '1D',
  className = '',
  minHeight = 300,
  maxHeight = 600,
  aspectRatio = 2,
}: ChartContainerProps) {
  const { setCurrentAsset, setTimeframe, setData, setLoading, setError } = useChartStore();
  
  // 內部管理 timeframe 狀態
  const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeType>(initialTimeframe);

  // 使用 React Query 獲取圖表資料
  const {
    data: chartResponse,
    isLoading,
    error,
    refetch,
  } = useChartData(asset.symbol, currentTimeframe, asset.assetType, {
    enabled: !!asset.symbol,
    refetchInterval: 5 * 60 * 1000, // 5分鐘自動刷新
  });

  // 同步狀態到 store
  useEffect(() => {
    setCurrentAsset(asset);
    setTimeframe(currentTimeframe);
  }, [asset, currentTimeframe, setCurrentAsset, setTimeframe]);

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
        timestamp: new Date(point.timestamp), // timestamp 已經是毫秒
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
            {asset.name} ({asset.symbol}) - {currentTimeframe}
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
    timestamp: new Date(point.timestamp), // timestamp 已經是毫秒
  }));

  // 處理時間範圍變更
  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setCurrentTimeframe(newTimeframe);
    setTimeframe(newTimeframe);
  };

  return (
    <InteractiveChart
      asset={asset}
      data={candlesticks}
      timeframe={currentTimeframe}
      onTimeframeChange={handleTimeframeChange}
      onRefresh={handleRetry}
      isLoading={isLoading}
      className={className}
      minHeight={minHeight}
      maxHeight={maxHeight}
      aspectRatio={aspectRatio}
    />
  );
}