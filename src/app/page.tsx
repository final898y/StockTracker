'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUpIcon, 
  BarChart3Icon, 
  SearchIcon, 
  SmartphoneIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 延遲自動重定向，讓使用者看到歡迎頁面
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6 mx-auto">
            <TrendingUpIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">股票追蹤系統</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">正在載入儀表板...</p>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* 導航欄 */}
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                股票追蹤器
              </span>
            </div>
            <button
              onClick={handleEnterDashboard}
              className="btn btn-primary btn-md flex items-center space-x-2"
            >
              <span>進入應用</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="container-responsive py-12 sm:py-20">
        <div className="text-center mb-16">
          {/* 主標題 */}
          <div className="flex items-center justify-center w-20 h-20 bg-blue-500 rounded-2xl mb-8 mx-auto">
            <TrendingUpIcon className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            專業的
            <span className="text-blue-600 dark:text-blue-400"> 投資追蹤 </span>
            工具
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            追蹤美股和加密貨幣價格，查看專業K線圖表，管理您的投資組合。
            簡潔易用的介面，讓投資決策更加明智。
          </p>

          {/* CTA 按鈕 */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={handleEnterDashboard}
              className="flex items-center space-x-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 
                       text-white rounded-xl transition-colors text-lg font-medium shadow-lg 
                       hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>開始使用</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => router.push('/test-chart')}
              className="flex items-center space-x-2 px-8 py-4 bg-white dark:bg-gray-800 
                       hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white 
                       border border-gray-300 dark:border-gray-600 rounded-xl transition-colors 
                       text-lg font-medium"
            >
              <BarChart3Icon className="h-5 w-5" />
              <span>查看圖表示例</span>
            </button>
          </div>
        </div>

        {/* 功能特色 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 
                          rounded-xl mb-6">
              <SearchIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              智能搜尋
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              快速搜尋美股和加密貨幣，支援股票代碼和公司名稱搜尋，
              輕鬆找到您想要追蹤的資產。
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 
                          rounded-xl mb-6">
              <BarChart3Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              專業圖表
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              採用 TradingView 圖表庫，提供專業級K線圖表，
              支援多種時間範圍和技術分析工具。
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 
                          rounded-xl mb-6">
              <SmartphoneIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              響應式設計
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              完美適配桌面和行動裝置，無論何時何地都能
              輕鬆管理您的投資組合。
            </p>
          </div>
        </div>

        {/* 功能清單 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            主要功能
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              '追蹤美股和加密貨幣價格',
              '即時價格更新和變動提醒',
              '專業K線圖表和技術分析',
              '個人化追蹤清單管理',
              '響應式設計支援行動裝置',
              '本地資料存儲保護隱私'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 頁腳 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 股票追蹤器. 專為投資者打造的追蹤工具.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
