'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createChart, IChartApi, CandlestickData as LWCCandlestickData } from 'lightweight-charts';
import { CandlestickData } from '@/types';

interface CandlestickChartProps {
  data: CandlestickData[];
  width?: number;
  height?: number;
  className?: string;
  onReady?: (chart: IChartApi) => void;
}

export function CandlestickChart({
  data,
  width = 800,
  height = 400,
  className = '',
  onReady,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

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
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#cccccc',
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    onReady?.(chart);

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [width, height, onReady]);

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
    />
  );
}