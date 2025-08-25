'use client';

import React, { useState, useRef, useCallback } from 'react';
import { IChartApi } from 'lightweight-charts';
import { CandlestickChart } from './CandlestickChart';
import { ChartControls } from './ChartControls';
import { CandlestickData, TimeframeType, Asset } from '@/types';

interface InteractiveChartProps {
  asset: Asset;
  data: CandlestickData[];
  timeframe: TimeframeType;
  onTimeframeChange: (timeframe: TimeframeType) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export function InteractiveChart({
  asset,
  data,
  timeframe,
  onTimeframeChange,
  onRefresh,
  isLoading = false,
  className = '',
  minHeight = 400,
  maxHeight = 800,
  aspectRatio = 2,
}: InteractiveChartProps) {
  const [chartInstance, setChartInstance] = useState<IChartApi | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 圖表準備就緒回調
  const handleChartReady = useCallback((chart: IChartApi) => {
    setChartInstance(chart);
  }, []);

  // 響應式尺寸計算
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    let calculatedHeight = containerWidth / aspectRatio;
    
    // 限制高度範圍
    calculatedHeight = Math.max(minHeight, Math.min(maxHeight, calculatedHeight));

    setDimensions({
      width: containerWidth,
      height: calculatedHeight,
    });
  }, [aspectRatio, minHeight, maxHeight]);

  // 監聽容器尺寸變化
  React.useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 圖表標題和資訊 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {asset.name} ({asset.symbol})
          </h3>
          <p className="text-sm text-gray-600">
            {asset.assetType === 'stock' ? '股票' : '加密貨幣'}
            {asset.exchange && ` • ${asset.exchange}`}
          </p>
        </div>
        
        {/* 資料統計 */}
        {data.length > 0 && (
          <div className="text-right text-sm text-gray-600">
            <div>資料點數: {data.length}</div>
            <div>
              時間範圍: {data[0]?.timestamp.toLocaleDateString('zh-TW')} - {data[data.length - 1]?.timestamp.toLocaleDateString('zh-TW')}
            </div>
          </div>
        )}
      </div>

      {/* 圖表控制器 */}
      <ChartControls
        chart={chartInstance}
        currentTimeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />

      {/* 圖表容器 */}
      <div 
        ref={containerRef}
        className="w-full border border-gray-200 rounded-lg bg-white overflow-hidden"
      >
        {data.length > 0 ? (
          <CandlestickChart
            data={data}
            width={dimensions.width}
            height={dimensions.height}
            onReady={handleChartReady}
            enableInteraction={true}
            showCrosshair={true}
            showTooltip={true}
            className="w-full"
          />
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-50"
            style={{ height: dimensions.height }}
          >
            <div className="text-center p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600">載入圖表資料中...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">暫無圖表資料</p>
                  <p className="text-sm text-gray-500">
                    {asset.name} ({asset.symbol}) - {timeframe}
                  </p>
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      className="mt-3 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      重新載入
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 圖表說明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-4">
          <span>• 滑鼠滾輪: 縮放圖表</span>
          <span>• 拖拽: 平移圖表</span>
          <span>• 滑鼠懸停: 顯示詳細資訊</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>• 綠色: 上漲</span>
          <span>• 紅色: 下跌</span>
          <span>• 點擊「適合內容」重置視圖</span>
        </div>
      </div>
    </div>
  );
}