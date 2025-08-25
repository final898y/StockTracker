'use client';

import { ChartContainer } from '@/components/charts';
import { Asset } from '@/types';

const testAsset: Asset = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  assetType: 'stock',
  exchange: 'NASDAQ',
};

export default function TestChartPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">圖表測試頁面</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Apple 股票圖表</h2>
          <ChartContainer 
            asset={testAsset}
            timeframe="1D"
            className="w-full"
            minHeight={400}
          />
        </div>
      </div>
    </div>
  );
}