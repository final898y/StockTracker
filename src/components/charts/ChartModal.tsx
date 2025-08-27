'use client';

import { useEffect, useCallback, useState } from 'react';
import { InteractiveChart } from './InteractiveChart';
import { useChartStore } from '@/stores/chart-store';
import { useChartData } from '@/hooks/use-chart-data';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChartModal({ isOpen, onClose }: ChartModalProps) {
  const {
    currentAsset,
    timeframe,
    isFullscreen,
    autoRefresh,
    refreshInterval,
    setTimeframe,
    toggleFullscreen,
    setFullscreen,
    updateLastRefresh,
  } = useChartStore();

  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // 使用 React Query 獲取圖表資料，支援即時更新
  const {
    data: chartResponse,
    isLoading,
    error,
    refetch,
  } = useChartData(currentAsset?.symbol || '', timeframe, {
    enabled: !!currentAsset?.symbol && isOpen,
    refetchInterval: realTimeEnabled && autoRefresh ? refreshInterval : undefined,
  });

  // 處理即時更新
  const handleRealTimeToggle = useCallback(() => {
    setRealTimeEnabled(!realTimeEnabled);
  }, [realTimeEnabled]);

  // 手動刷新處理
  const handleRefresh = useCallback(() => {
    refetch();
    updateLastRefresh();
    setLastUpdateTime(new Date());
  }, [refetch, updateLastRefresh]);

  // 監聽資料更新
  useEffect(() => {
    if (chartResponse) {
      setLastUpdateTime(new Date());
      updateLastRefresh();
    }
  }, [chartResponse, updateLastRefresh]);

  // ESC 鍵關閉模態框和全螢幕控制
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          setFullscreen(false);
        } else {
          onClose();
        }
      }
      // F11 切換全螢幕
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
      // R 鍵刷新
      if (event.key === 'r' || event.key === 'R') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleRefresh();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止背景滾動
      document.body.style.overflow = 'hidden';
      
      // 全螢幕模式下隱藏滾動條
      if (isFullscreen) {
        document.documentElement.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, onClose, setFullscreen, toggleFullscreen, handleRefresh]);

  // 處理時間範圍變更
  const handleTimeframeChange = (newTimeframe: typeof timeframe) => {
    setTimeframe(newTimeframe);
    // 切換時間範圍時立即刷新
    setTimeout(() => {
      handleRefresh();
    }, 100);
  };

  if (!isOpen || !currentAsset) {
    return null;
  }

  // 轉換資料格式
  const candlesticks = chartResponse?.data?.map(point => ({
    openPrice: point.open,
    highPrice: point.high,
    lowPrice: point.low,
    closePrice: point.close,
    volume: point.volume,
    timestamp: new Date(point.timestamp * 1000),
  })) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => !isFullscreen && onClose()}
      />

      {/* 模態框內容 */}
      <div className={`
        relative h-full flex flex-col transition-all duration-300
        ${isFullscreen 
          ? 'w-full bg-white' 
          : 'max-w-7xl mx-auto my-4 h-[calc(100vh-2rem)] bg-white rounded-lg shadow-xl'
        }
      `}>
        {/* 標題欄 */}
        <div className={`
          flex items-center justify-between p-4 border-b border-gray-200
          ${isFullscreen ? 'bg-white shadow-sm' : ''}
        `}>
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              圖表分析 - {currentAsset.name} ({currentAsset.symbol})
            </h2>
            <div className="flex items-center space-x-2">
              {error && (
                <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                  載入失敗
                </span>
              )}
              {isLoading && (
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  載入中
                </span>
              )}
              {realTimeEnabled && (
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>即時更新</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 即時更新切換 */}
            <button
              onClick={handleRealTimeToggle}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${realTimeEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              title={realTimeEnabled ? '關閉即時更新' : '開啟即時更新'}
            >
              {realTimeEnabled ? '即時' : '手動'}
            </button>

            {/* 手動刷新按鈕 */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="手動刷新 (Ctrl+R)"
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 全螢幕切換按鈕 */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title={isFullscreen ? '退出全螢幕 (F11)' : '全螢幕 (F11)'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>

            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="關閉 (ESC)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 圖表內容 */}
        <div className="flex-1 p-4 overflow-hidden">
          {error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-red-600">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">載入圖表資料失敗</h3>
                <p className="text-gray-600">{error.message || '無法獲取圖表資料，請稍後再試'}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  重新載入
                </button>
              </div>
            </div>
          ) : (
            <InteractiveChart
              asset={currentAsset}
              data={candlesticks}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              className="h-full"
              minHeight={isFullscreen ? 600 : 400}
              maxHeight={isFullscreen ? 1000 : 600}
              aspectRatio={isFullscreen ? 2.5 : 2}
            />
          )}
        </div>

        {/* 狀態欄 */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>快捷鍵: ESC 關閉 • F11 全螢幕 • Ctrl+R 刷新</span>
              {lastUpdateTime && (
                <span>最後更新: {lastUpdateTime.toLocaleString('zh-TW')}</span>
              )}
              {candlesticks.length > 0 && (
                <span>資料點數: {candlesticks.length}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {realTimeEnabled && (
                <span className="text-green-600">
                  自動更新間隔: {Math.floor(refreshInterval / 1000)}秒
                </span>
              )}
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  <span>載入中...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}