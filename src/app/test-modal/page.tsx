'use client';


import { ChartModal } from '@/components/charts';
import { useChartStore } from '@/stores/chart-store';
import { Asset } from '@/types';

const testAssets: Asset[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'stock',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    assetType: 'stock',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'bitcoin',
    name: 'Bitcoin',
    assetType: 'crypto',
  },
  {
    symbol: 'ethereum',
    name: 'Ethereum',
    assetType: 'crypto',
  },
];

export default function TestModalPage() {
  const { isModalOpen, openModal, closeModal } = useChartStore();

  const handleOpenChart = (asset: Asset) => {
    openModal(asset, '1D');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">圖表模態框測試頁面</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">測試功能</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">功能清單:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ 模態視窗顯示圖表</li>
              <li>✅ 全螢幕檢視功能 (F11 切換)</li>
              <li>✅ 即時資料更新 (可開關)</li>
              <li>✅ 鍵盤快捷鍵 (ESC 關閉, Ctrl+R 刷新)</li>
              <li>✅ 響應式設計</li>
              <li>✅ 時間範圍切換</li>
              <li>✅ 手動刷新功能</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">測試資產</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testAssets.map((asset) => (
              <div
                key={asset.symbol}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {asset.symbol}
                    </h3>
                    <p className="text-gray-600">{asset.name}</p>
                    <p className="text-sm text-gray-500">
                      {asset.assetType === 'stock' ? '股票' : '加密貨幣'}
                      {asset.exchange && ` • ${asset.exchange}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenChart(asset)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    開啟圖表
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">使用說明</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">鍵盤快捷鍵:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> - 關閉模態框</li>
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">F11</kbd> - 切換全螢幕</li>
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+R</kbd> - 手動刷新</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">滑鼠操作:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>滾輪 - 縮放圖表</li>
                  <li>拖拽 - 平移圖表</li>
                  <li>懸停 - 顯示詳細資訊</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表模態框 */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}