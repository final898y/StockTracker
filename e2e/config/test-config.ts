/**
 * E2E測試配置
 * 定義測試環境、資料和常數
 */

export const TEST_CONFIG = {
  // 測試資料
  testAssets: {
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'TSLA', name: 'Tesla Inc.' }
    ],
    crypto: [
      { symbol: 'BTC', name: 'Bitcoin' },
      { symbol: 'ETH', name: 'Ethereum' },
      { symbol: 'ADA', name: 'Cardano' },
      { symbol: 'DOT', name: 'Polkadot' }
    ],
    invalid: [
      'INVALIDSTOCK123',
      'NOTFOUND',
      'FAKE123',
      'NONEXISTENT'
    ]
  },

  // 測試超時設定
  timeouts: {
    short: 5000,      // 5秒 - 快速操作
    medium: 15000,    // 15秒 - 一般API請求
    long: 30000,      // 30秒 - 圖表載入
    veryLong: 60000   // 60秒 - 複雜操作
  },

  // 視窗尺寸設定
  viewports: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    tabletLandscape: { width: 1024, height: 768 },
    mobile: { width: 375, height: 667 },
    mobileLarge: { width: 414, height: 896 },
    mobileSmall: { width: 320, height: 568 }
  },

  // API端點
  apiEndpoints: {
    stockSearch: '/api/stocks/search',
    stockDetails: '/api/stocks',
    cryptoSearch: '/api/crypto/search',
    cryptoDetails: '/api/crypto',
    chartData: '/api/charts'
  },

  // 測試選擇器
  selectors: {
    // 搜尋相關
    searchInput: '[data-testid="search-input"]',
    searchButton: '[data-testid="search-button"]',
    searchResults: '[data-testid="search-results"]',
    searchResultItem: '[data-testid="search-result-item"]',
    noResults: '[data-testid="no-results"]',
    
    // 標籤切換
    stockTab: '[data-testid="stock-tab"]',
    cryptoTab: '[data-testid="crypto-tab"]',
    
    // 追蹤清單
    watchlistTable: '[data-testid="watchlist-table"]',
    watchlistItem: '[data-testid="watchlist-item"]',
    watchlistCards: '[data-testid="watchlist-cards"]',
    emptyWatchlist: '[data-testid="empty-watchlist"]',
    addToWatchlist: '[data-testid="add-to-watchlist"]',
    removeFromWatchlist: '[data-testid="remove-from-watchlist"]',
    confirmRemove: '[data-testid="confirm-remove"]',
    
    // 圖表相關
    viewChart: '[data-testid="view-chart"]',
    chartModal: '[data-testid="chart-modal"]',
    chartContainer: '[data-testid="chart-container"]',
    chartTitle: '[data-testid="chart-title"]',
    closeChart: '[data-testid="close-chart"]',
    fullscreenChart: '[data-testid="fullscreen-chart"]',
    timeRangeSelector: '[data-testid="time-range-selector"]',
    
    // 載入和錯誤狀態
    loadingIndicator: '[data-testid="loading-indicator"]',
    chartLoading: '[data-testid="chart-loading"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    chartError: '[data-testid="chart-error"]',
    
    // 其他UI元素
    header: '[data-testid="header"]',
    searchSection: '[data-testid="search-section"]',
    watchlistSection: '[data-testid="watchlist-section"]',
    mainContainer: '[data-testid="main-container"]',
    mobileNav: '[data-testid="mobile-nav"]',
    themeToggle: '[data-testid="theme-toggle"]'
  },

  // 時間範圍選項
  timeRanges: ['1D', '1W', '1M', '3M', '1Y'] as const,

  // 錯誤訊息
  errorMessages: {
    searchFailed: '搜尋失敗',
    noResults: '找不到相關結果',
    chartLoadFailed: '圖表載入失敗',
    networkError: '網路連線異常',
    rateLimitExceeded: 'API使用量已達上限',
    storageError: '資料存儲失敗',
    validationError: '請輸入股票代碼',
    alreadyExists: '已存在於追蹤清單',
    browserCompatibility: '瀏覽器版本過舊'
  },

  // 成功訊息
  successMessages: {
    addedToWatchlist: '已加入追蹤清單',
    removedFromWatchlist: '已從追蹤清單移除'
  },

  // 測試環境設定
  environment: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:3000/api',
    isCI: !!process.env.CI,
    headless: process.env.HEADLESS !== 'false'
  },

  // 效能測試設定
  performance: {
    maxLoadTime: 3000,        // 最大載入時間 3秒
    maxApiResponseTime: 2000, // 最大API回應時間 2秒
    maxChartRenderTime: 5000  // 最大圖表渲染時間 5秒
  },

  // 重試設定
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  }
};

// 時間範圍選擇器生成函數
export function getTimeRangeSelector(range: typeof TEST_CONFIG.timeRanges[number]) {
  return `[data-testid="time-range-${range}"]`;
}

// 根據環境獲取配置
export function getEnvironmentConfig() {
  const { environment } = TEST_CONFIG;
  
  return {
    ...environment,
    timeout: environment.isCI ? TEST_CONFIG.timeouts.long : TEST_CONFIG.timeouts.medium,
    retries: environment.isCI ? TEST_CONFIG.retry.maxRetries : 1
  };
}

// 獲取測試資產
export function getTestAsset(type: 'stock' | 'crypto', index: number = 0) {
  const assets = TEST_CONFIG.testAssets[type === 'stock' ? 'stocks' : 'crypto'];
  return assets[index] || assets[0];
}

// 獲取隨機測試資產
export function getRandomTestAsset(type: 'stock' | 'crypto') {
  const assets = TEST_CONFIG.testAssets[type === 'stock' ? 'stocks' : 'crypto'];
  const randomIndex = Math.floor(Math.random() * assets.length);
  return assets[randomIndex];
}

export default TEST_CONFIG;