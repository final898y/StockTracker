'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAssetPrice } from '@/hooks/use-asset-price';
import { useChartData } from '@/hooks/use-chart-data';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { CandlestickChart, TimeRangeSelector } from '@/components/charts';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';
import { Asset, TimeframeType, StockDetailsResponse, CryptoDetailsResponse } from '@/types';
import { 
  ArrowLeftIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  PlusIcon,
  MinusIcon,
  ExternalLinkIcon,
  RefreshCwIcon
} from 'lucide-react';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  
  // 從 URL 查詢參數獲取資產類型，預設為 stock
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock');
  const [timeRange, setTimeRange] = useState<TimeframeType>('1D');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { items: watchlistItems, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  // 檢查是否在追蹤清單中
  const isInWatchlist = watchlistItems.some(item => 
    item.asset.symbol.toLowerCase() === symbol.toLowerCase()
  );

  // 獲取價格資料
  const {
    data: priceData,
    isLoading: priceLoading,
    error: priceError,
    refetch: refetchPrice
  } = useAssetPrice(symbol, assetType);

  // 獲取圖表資料
  const {
    data: chartData,
    isLoading: chartLoading,
    error: chartError,
    refetch: refetchChart
  } = useChartData(symbol, timeRange, assetType);

  // 處理返回
  const handleGoBack = () => {
    router.back();
  };

  // 從 URL 查詢參數獲取資產類型
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type') as 'stock' | 'crypto';
      if (type && (type === 'stock' || type === 'crypto')) {
        setAssetType(type);
      } else {
        // 如果沒有提供類型參數，預設為 stock
        setAssetType('stock');
      }
    }
  }, []);

  // 確保 symbol 存在
  if (!symbol) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            資產代碼無效
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            請提供有效的資產代碼
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 處理添加/移除追蹤清單
  const handleToggleWatchlist = async () => {
    if (!priceData) return;

    const asset: Asset = {
      symbol: symbol.toUpperCase(),
      name: normalizedData?.name || symbol.toUpperCase(),
      assetType,
    };

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(symbol);
      } else {
        await addToWatchlist(asset);
      }
    } catch (error) {
      console.error('操作追蹤清單失敗:', error);
    }
  };

  // 處理重新整理
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchPrice(), refetchChart()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 標準化價格資料
  const getNormalizedPriceData = () => {
    if (!priceData) return null;
    
    if (assetType === 'stock') {
      const stockData = priceData as StockDetailsResponse;
      return {
        price: stockData.price,
        name: stockData.name,
        change24h: stockData.changePercent,
        volume: stockData.volume,
        marketCap: stockData.marketCap,
      };
    } else {
      const cryptoData = priceData as CryptoDetailsResponse;
      return {
        price: cryptoData.current_price,
        name: cryptoData.name,
        change24h: cryptoData.price_change_percentage_24h,
        volume: cryptoData.total_volume,
        marketCap: cryptoData.market_cap,
      };
    }
  };

  const normalizedData = getNormalizedPriceData();

  // 格式化價格
  const formatPrice = (price: number) => {
    if (assetType === 'crypto') {
      return price < 1 
        ? `$${price.toFixed(6)}` 
        : `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 格式化變動百分比
  const formatChangePercent = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const isLoading = priceLoading || chartLoading;
  const hasError = priceError || chartError;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 導航欄 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 
                         hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 
                         dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="hidden sm:inline">返回</span>
              </button>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {symbol.toUpperCase()}
                </h1>
                {normalizedData?.name && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {normalizedData.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* 重新整理按鈕 */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                         dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 
                         rounded-lg transition-colors disabled:opacity-50"
                title="重新整理"
              >
                <RefreshCwIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* 追蹤清單按鈕 */}
              <button
                onClick={handleToggleWatchlist}
                disabled={!priceData}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${isInWatchlist
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isInWatchlist ? (
                  <>
                    <MinusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">移除追蹤</span>
                    <span className="sm:hidden">移除</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">加入追蹤</span>
                    <span className="sm:hidden">追蹤</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 錯誤狀態 */}
        {hasError && (
          <div className="mb-6">
            <ErrorMessage 
              message={
                (priceError instanceof Error ? priceError.message : priceError) ||
                (chartError instanceof Error ? chartError.message : chartError) ||
                '載入資料時發生錯誤'
              }
              onRetry={handleRefresh}
            />
          </div>
        )}

        {/* 載入狀態 */}
        {isLoading && !priceData && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* 價格資訊卡片 */}
        {priceData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 
                        dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 當前價格 */}
              <div className="md:col-span-1">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">當前價格</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(normalizedData?.price || 0)}
                  </p>
                  {normalizedData?.change24h !== undefined && (
                    <div className={`
                      flex items-center justify-center md:justify-start space-x-1 mt-2
                      ${normalizedData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {normalizedData.change24h >= 0 ? (
                        <TrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {formatChangePercent(normalizedData.change24h)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 統計資訊 */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {normalizedData?.volume && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">成交量</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {normalizedData.volume.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {normalizedData?.marketCap && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">市值</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${(normalizedData.marketCap / 1e9).toFixed(2)}B
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">資產類型</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assetType === 'stock' ? '股票' : '加密貨幣'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 圖表區域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 
                      dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
              價格走勢圖
            </h2>
            
            <TimeRangeSelector
              currentTimeframe={timeRange}
              onTimeframeChange={setTimeRange}
            />
          </div>

          {/* 圖表載入狀態 */}
          {chartLoading && (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* 圖表錯誤狀態 */}
          {chartError && !chartLoading && (
            <div className="flex items-center justify-center h-96">
              <ErrorMessage 
                message="無法載入圖表資料"
                onRetry={() => refetchChart()}
              />
            </div>
          )}

          {/* 圖表 */}
          {chartData && !chartLoading && (
            <div className="h-96 sm:h-[500px]">
              <CandlestickChart
                data={chartData.data.map(item => ({
                  openPrice: item.open,
                  highPrice: item.high,
                  lowPrice: item.low,
                  closePrice: item.close,
                  volume: item.volume,
                  timestamp: new Date(item.timestamp * 1000),
                }))}
              />
            </div>
          )}
        </div>

        {/* 外部連結 */}
        <div className="mt-6 flex flex-wrap gap-3">
          {assetType === 'stock' && (
            <>
              <a
                href={`https://finance.yahoo.com/quote/${symbol}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 
                         text-white rounded-lg transition-colors text-sm font-medium"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                <span>Yahoo Finance</span>
              </a>
              
              <a
                href={`https://www.google.com/finance/quote/${symbol}:NASDAQ`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                         text-white rounded-lg transition-colors text-sm font-medium"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                <span>Google Finance</span>
              </a>
            </>
          )}

          {assetType === 'crypto' && (
            <>
              <a
                href={`https://www.coingecko.com/en/coins/${symbol.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 
                         text-white rounded-lg transition-colors text-sm font-medium"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                <span>CoinGecko</span>
              </a>
              
              <a
                href={`https://coinmarketcap.com/currencies/${symbol.toLowerCase()}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 
                         text-white rounded-lg transition-colors text-sm font-medium"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                <span>CoinMarketCap</span>
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
}