'use client';

import { useState } from 'react';
import { IChartApi, Time } from 'lightweight-charts';
import { TimeframeType } from '@/types';
import { TimeRangeSelector } from './TimeRangeSelector';

interface ChartControlsProps {
  chart: IChartApi | null;
  currentTimeframe: TimeframeType;
  onTimeframeChange: (timeframe: TimeframeType) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ChartControls({
  chart,
  currentTimeframe,
  onTimeframeChange,
  onRefresh,
  isLoading = false,
  className = '',
}: ChartControlsProps) {
  const [isAutoFit, setIsAutoFit] = useState(true);

  // 重置圖表視圖到適合內容
  const handleFitContent = () => {
    if (!chart) return;
    chart.timeScale().fitContent();
    setIsAutoFit(true);
  };

  // 放大圖表
  const handleZoomIn = () => {
    if (!chart) return;
    const timeScale = chart.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    
    if (visibleRange) {
      const fromTime = visibleRange.from as number;
      const toTime = visibleRange.to as number;
      const center = (fromTime + toTime) / 2;
      const range = toTime - fromTime;
      const newRange = range * 0.8; // 縮小20%
      
      timeScale.setVisibleRange({
        from: (center - newRange / 2) as Time,
        to: (center + newRange / 2) as Time,
      });
      setIsAutoFit(false);
    }
  };

  // 縮小圖表
  const handleZoomOut = () => {
    if (!chart) return;
    const timeScale = chart.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    
    if (visibleRange) {
      const fromTime = visibleRange.from as number;
      const toTime = visibleRange.to as number;
      const center = (fromTime + toTime) / 2;
      const range = toTime - fromTime;
      const newRange = range * 1.25; // 放大25%
      
      timeScale.setVisibleRange({
        from: (center - newRange / 2) as Time,
        to: (center + newRange / 2) as Time,
      });
      setIsAutoFit(false);
    }
  };

  // 向左平移
  const handlePanLeft = () => {
    if (!chart) return;
    const timeScale = chart.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    
    if (visibleRange) {
      const fromTime = visibleRange.from as number;
      const toTime = visibleRange.to as number;
      const range = toTime - fromTime;
      const shift = range * 0.2; // 移動20%的範圍
      
      timeScale.setVisibleRange({
        from: (fromTime - shift) as Time,
        to: (toTime - shift) as Time,
      });
      setIsAutoFit(false);
    }
  };

  // 向右平移
  const handlePanRight = () => {
    if (!chart) return;
    const timeScale = chart.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    
    if (visibleRange) {
      const fromTime = visibleRange.from as number;
      const toTime = visibleRange.to as number;
      const range = toTime - fromTime;
      const shift = range * 0.2; // 移動20%的範圍
      
      timeScale.setVisibleRange({
        from: (fromTime + shift) as Time,
        to: (toTime + shift) as Time,
      });
      setIsAutoFit(false);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* 時間範圍選擇器 */}
      <TimeRangeSelector
        currentTimeframe={currentTimeframe}
        onTimeframeChange={onTimeframeChange}
        disabled={isLoading}
      />

      {/* 圖表控制按鈕 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">圖表控制:</span>
          
          {/* 縮放控制 */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
            <button
              onClick={handleZoomIn}
              disabled={!chart || isLoading}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="放大"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <div className="w-px h-4 bg-gray-300" />
            <button
              onClick={handleZoomOut}
              disabled={!chart || isLoading}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="縮小"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>

          {/* 平移控制 */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
            <button
              onClick={handlePanLeft}
              disabled={!chart || isLoading}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="向左平移"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-px h-4 bg-gray-300" />
            <button
              onClick={handlePanRight}
              disabled={!chart || isLoading}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="向右平移"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 適合內容按鈕 */}
          <button
            onClick={handleFitContent}
            disabled={!chart || isLoading}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md border transition-colors
              ${
                isAutoFit
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title="適合內容"
          >
            適合內容
          </button>
        </div>

        {/* 刷新按鈕 */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="刷新資料"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isLoading ? '載入中...' : '刷新'}</span>
          </button>
        )}
      </div>
    </div>
  );
}