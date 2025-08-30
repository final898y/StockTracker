import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { CandlestickChart } from '../CandlestickChart';
import { CandlestickData } from '@/types';

// Mock lightweight-charts
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addCandlestickSeries: vi.fn(() => ({
      setData: vi.fn(),
    })),
    applyOptions: vi.fn(),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
    })),
    remove: vi.fn(),
  })),
}));

const mockData: CandlestickData[] = [
  {
    openPrice: 100,
    highPrice: 110,
    lowPrice: 95,
    closePrice: 105,
    volume: 1000,
    timestamp: new Date('2024-01-01'),
  },
  {
    openPrice: 105,
    highPrice: 115,
    lowPrice: 100,
    closePrice: 110,
    volume: 1200,
    timestamp: new Date('2024-01-02'),
  },
];

describe('CandlestickChart', () => {
  it('renders chart container', () => {
    render(<CandlestickChart data={mockData} />);
    
    // 檢查是否有圖表容器
    const chartContainer = document.querySelector('div[style*="width"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('applies custom dimensions', () => {
    render(<CandlestickChart data={mockData} width={600} height={300} />);
    
    const chartContainer = document.querySelector('div[style*="width: 600px"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CandlestickChart data={mockData} className="custom-chart" />);
    
    const chartContainer = document.querySelector('.custom-chart');
    expect(chartContainer).toBeInTheDocument();
  });
});