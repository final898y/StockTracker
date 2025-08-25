'use client';

import { useState, useEffect, useRef } from 'react';
import { CandlestickChart } from './CandlestickChart';
import { CandlestickData } from '@/types';

interface ResponsiveChartProps {
  data: CandlestickData[];
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export function ResponsiveChart({
  data,
  className = '',
  minHeight = 300,
  maxHeight = 600,
  aspectRatio = 2, // width:height = 2:1
}: ResponsiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      let calculatedHeight = containerWidth / aspectRatio;
      
      // 限制高度範圍
      calculatedHeight = Math.max(minHeight, Math.min(maxHeight, calculatedHeight));

      setDimensions({
        width: containerWidth,
        height: calculatedHeight,
      });
    };

    // 初始化尺寸
    updateDimensions();

    // 監聽視窗大小變化
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio, minHeight, maxHeight]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <CandlestickChart
        data={data}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full"
      />
    </div>
  );
}