'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createChart, IChartApi, CandlestickData as LWCCandlestickData, MouseEventParams } from 'lightweight-charts';
import { CandlestickData } from '@/types';

interface CandlestickChartProps {
  data: CandlestickData[];
  width?: number;
  height?: number;
  className?: string;
  onReady?: (chart: IChartApi) => void;
  enableInteraction?: boolean;
  showCrosshair?: boolean;
  showTooltip?: boolean;
}

export function CandlestickChart({
  data,
  width = 800,
  height = 400,
  className = '',
  onReady,
  enableInteraction = true,
  showCrosshair = true,
  showTooltip = true,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: CandlestickData | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  // 轉換資料格式
  const convertData = useCallback((candlesticks: CandlestickData[]): LWCCandlestickData[] => {
    return candlesticks.map(item => ({
      time: Math.floor(item.timestamp.getTime() / 1000) as any,
      open: item.openPrice,
      high: item.highPrice,
      low: item.lowPrice,
      close: item.closePrice,
    }));
  }, []);

  // 格式化價格顯示
  const formatPrice = useCallback((price: number): string => {
    return price.toLocaleString('zh-TW', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }, []);

  // 格式化成交量顯示
  const formatVolume = useCallback((volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  }, []);

  // 處理滑鼠移動事件
  const handleMouseMove = useCallback((param: MouseEventParams) => {
    if (!showTooltip || !chartContainerRef.current || !param.time) {
      setTooltipData(prev => ({ ...prev, visible: false }));
      return;
    }

    const candlestickData = param.seriesData.get(seriesRef.current);
    if (!candlestickData) {
      setTooltipData(prev => ({ ...prev, visible: false }));
      return;
    }

    // 找到對應的原始資料
    const timestamp = new Date((param.time as number) * 1000);
    const originalData = data.find(item => 
      Math.abs(item.timestamp.getTime() - timestamp.getTime()) < 60000 // 1分鐘容差
    );

    if (!originalData) {
      setTooltipData(prev => ({ ...prev, visible: false }));
      return;
    }

    const containerRect = chartContainerRef.current.getBoundingClientRect();
    const x = param.point?.x || 0;
    const y = param.point?.y || 0;

    setTooltipData({
      visible: true,
      x: x + 10, // 偏移一點避免遮擋
      y: y - 10,
      data: originalData,
    });
  }, [data, showTooltip]);

  // 初始化圖表
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#e1e5e9' },
        horzLines: { color: '#e1e5e9' },
      },
      crosshair: {
        mode: showCrosshair ? 1 : 0,
      },
      rightPriceScale: {
        borderColor: '#cccccc',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 6,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      handleScroll: enableInteraction,
      handleScale: enableInteraction,
    });

    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // 添加滑鼠事件監聽
    if (showTooltip) {
      chart.subscribeCrosshairMove(handleMouseMove);
    }

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    onReady?.(chart);

    return () => {
      if (showTooltip) {
        chart.unsubscribeCrosshairMove(handleMouseMove);
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [width, height, onReady, enableInteraction, showCrosshair, showTooltip, handleMouseMove]);

  // 更新圖表資料
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    const chartData = convertData(data);
    seriesRef.current.setData(chartData);
    
    // 自動調整視圖範圍
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, convertData]);

  // 響應式調整
  useEffect(() => {
    if (!chartRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const containerWidth = chartContainerRef.current.clientWidth;
        const containerHeight = chartContainerRef.current.clientHeight;
        
        chartRef.current.applyOptions({
          width: containerWidth,
          height: containerHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={chartContainerRef} 
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {/* 工具提示 */}
      {showTooltip && tooltipData.visible && tooltipData.data && (
        <div
          ref={tooltipRef}
          className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm pointer-events-none"
          style={{
            left: Math.min(tooltipData.x, width - 200), // 防止超出右邊界
            top: Math.max(tooltipData.y, 0), // 防止超出上邊界
            maxWidth: '200px',
          }}
        >
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">
              {tooltipData.data.timestamp.toLocaleDateString('zh-TW')} {tooltipData.data.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">開盤:</span>
                <span className="ml-1 font-medium">{formatPrice(tooltipData.data.openPrice)}</span>
              </div>
              <div>
                <span className="text-gray-600">收盤:</span>
                <span className="ml-1 font-medium">{formatPrice(tooltipData.data.closePrice)}</span>
              </div>
              <div>
                <span className="text-gray-600">最高:</span>
                <span className="ml-1 font-medium text-green-600">{formatPrice(tooltipData.data.highPrice)}</span>
              </div>
              <div>
                <span className="text-gray-600">最低:</span>
                <span className="ml-1 font-medium text-red-600">{formatPrice(tooltipData.data.lowPrice)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">成交量:</span>
                <span className="ml-1 font-medium">{formatVolume(tooltipData.data.volume)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}