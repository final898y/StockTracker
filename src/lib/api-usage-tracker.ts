// API 使用量追蹤工具

// 模擬的 API 使用量資料存儲
// 在實際應用中，這些資料應該存儲在資料庫或快取中
const apiUsageData = new Map<string, {
  used: number;
  limit: number;
  resetTime: Date;
  lastUpdated: Date;
}>();

// 初始化預設資料
function initializeUsageData() {
  if (apiUsageData.size === 0) {
    apiUsageData.set('Alpha Vantage', {
      used: 0,
      limit: 25, // 免費版每日25次
      resetTime: getNextResetTime(),
      lastUpdated: new Date(),
    });

    apiUsageData.set('CoinGecko', {
      used: 0,
      limit: 50, // 免費版每分鐘50次
      resetTime: getNextMinuteReset(),
      lastUpdated: new Date(),
    });
  }
}

function getNextResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function getNextMinuteReset(): Date {
  const nextMinute = new Date();
  nextMinute.setMinutes(nextMinute.getMinutes() + 1);
  nextMinute.setSeconds(0, 0);
  return nextMinute;
}

// 更新 API 使用量的函數（供其他 API 路由調用）
export function incrementApiUsage(provider: string): boolean {
  initializeUsageData();
  
  const data = apiUsageData.get(provider);
  
  if (!data) {
    console.warn(`Unknown API provider: ${provider}`);
    return true; // 允許繼續，但記錄警告
  }

  // 檢查是否需要重置計數器
  const now = new Date();
  if (now >= data.resetTime) {
    data.used = 0;
    
    // 更新下次重置時間
    if (provider === 'Alpha Vantage') {
      data.resetTime = getNextResetTime();
    } else if (provider === 'CoinGecko') {
      data.resetTime = getNextMinuteReset();
    }
  }

  // 檢查是否超出限制
  if (data.used >= data.limit) {
    console.warn(`API limit exceeded for ${provider}: ${data.used}/${data.limit}`);
    return false;
  }

  // 增加使用計數
  data.used += 1;
  data.lastUpdated = now;
  
  return true;
}

// 檢查 API 是否可用的函數
export function checkApiAvailability(provider: string): {
  available: boolean;
  remaining: number;
  resetTime: Date;
} {
  initializeUsageData();
  
  const data = apiUsageData.get(provider);
  
  if (!data) {
    return {
      available: true,
      remaining: 0,
      resetTime: new Date(),
    };
  }

  // 檢查是否需要重置
  const now = new Date();
  if (now >= data.resetTime) {
    data.used = 0;
    
    if (provider === 'Alpha Vantage') {
      data.resetTime = getNextResetTime();
    } else if (provider === 'CoinGecko') {
      data.resetTime = getNextMinuteReset();
    }
  }

  return {
    available: data.used < data.limit,
    remaining: Math.max(0, data.limit - data.used),
    resetTime: data.resetTime,
  };
}

// 獲取使用量統計的函數
export function getUsageStats() {
  initializeUsageData();
  
  const stats = Array.from(apiUsageData.entries()).map(([provider, data]) => {
    const now = new Date();
    const needsReset = now >= data.resetTime;
    
    return {
      provider,
      used: needsReset ? 0 : data.used,
      limit: data.limit,
      percentage: needsReset ? 0 : (data.used / data.limit) * 100,
      resetTime: data.resetTime,
      available: needsReset ? true : data.used < data.limit,
    };
  });

  return stats;
}

// 獲取所有使用量資料
export function getAllUsageData() {
  initializeUsageData();
  
  return Array.from(apiUsageData.entries()).map(([provider, data]) => ({
    provider,
    used: data.used,
    limit: data.limit,
    resetTime: data.resetTime,
    lastUpdated: data.lastUpdated,
  }));
}