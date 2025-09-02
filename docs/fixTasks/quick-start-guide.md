# 測試修復快速開始指南

## 立即開始修復

如果你想立即開始修復測試問題，請按照以下步驟執行：

### 🚀 快速診斷

首先執行診斷命令了解當前狀況：

```bash
# 1. 檢查當前測試狀況
cd stock-tracker
npm test

# 2. 檢查 E2E 測試狀況  
npx playwright test --reporter=list

# 3. 檢查應用程式是否能正常啟動
npm run dev
# 開啟 http://localhost:3000 檢查頁面
```

### 🔧 緊急修復 (30分鐘內)

如果需要快速修復最關鍵的問題：

#### 1. 創建缺失的主題上下文 (10分鐘)

```bash
# 創建主題上下文檔案
mkdir -p src/contexts
```

創建 `src/contexts/theme-context.tsx`:
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setSystemTheme = () => setTheme('system');
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setLightTheme,
      setDarkTheme,
      setSystemTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeToggle must be used within ThemeProvider');
  }
  return context;
}
```

#### 2. 創建統一搜尋 Hook (10分鐘)

創建 `src/hooks/use-unified-search.ts`:
```typescript
import { useState, useCallback } from 'react';

interface SearchResults {
  stocks: any[];
  crypto: any[];
}

interface UnifiedSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResults;
  isLoading: boolean;
  error: string | null;
  searchHistory: string[];
  clearHistory: () => void;
  search: (query: string) => void;
  clear: () => void;
}

export function useUnifiedSearch(): UnifiedSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ stocks: [], crypto: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const search = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock search results for now
      setResults({
        stocks: [],
        crypto: []
      });
    } catch (err) {
      setError('搜尋失敗');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults({ stocks: [], crypto: [] });
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchHistory,
    clearHistory,
    search,
    clear
  };
}
```

#### 3. 修復基本的 Mock 配置 (10分鐘)

修復 `src/components/charts/__tests__/CandlestickChart.test.tsx`:
```typescript
// 在檔案頂部添加
const mocks = vi.hoisted(() => ({
  mockCreateChart: vi.fn(),
  mockRemove: vi.fn(),
  mockResize: vi.fn()
}));

vi.mock('lightweight-charts', () => ({
  createChart: mocks.mockCreateChart
}));

// 在測試中使用 mocks.mockCreateChart
```

### 🧪 驗證修復效果

```bash
# 執行特定測試驗證修復
npm test -- src/components/ui/__tests__/ThemeToggle.test.tsx
npm test -- src/components/search/__tests__/SearchBar.test.tsx
npm test -- src/components/charts/__tests__/CandlestickChart.test.tsx
```

### 📋 完整修復計劃

如果需要完整修復所有問題，請按順序執行：

1. **[Task 14.1: 修復缺失模組](./task-14.1-missing-modules.md)** (3天)
2. **[Task 14.2: 修復測試配置問題](./task-14.2-test-configuration.md)** (3天)  
3. **[Task 14.3: 修復單元測試邏輯問題](./task-14.3-unit-test-logic.md)** (3天)
4. **[Task 14.4: 修復 E2E 測試問題](./task-14.4-e2e-test-issues.md)** (4天)
5. **[Task 14.5: 整合測試和最終驗證](./task-14.5-integration-validation.md)** (2天)

### 🆘 常見問題快速解決

#### Q: 測試找不到模組怎麼辦？
```bash
# 檢查 tsconfig.json 中的路徑映射
# 確保 @/* 指向 src/*
```

#### Q: E2E 測試完全無法執行？
```bash
# 檢查 Playwright 安裝
npx playwright install

# 檢查應用程式是否啟動
npm run dev
```

#### Q: Mock 配置錯誤？
```typescript
// 使用 vi.hoisted() 確保正確提升
const mocks = vi.hoisted(() => ({
  mockFunction: vi.fn()
}));
```

### 📊 進度追蹤

使用以下命令追蹤修復進度：

```bash
# 檢查測試通過率
npm test -- --reporter=verbose | grep -E "(passed|failed)"

# 檢查 E2E 測試狀況
npx playwright test --reporter=line

# 檢查 TypeScript 錯誤
npm run type-check
```

### 🎯 優先級建議

如果時間有限，建議按以下優先級修復：

1. **高優先級**: 缺失模組 (影響 55+ 測試)
2. **高優先級**: E2E 測試基本啟動 (影響 190 測試)
3. **中優先級**: Mock 配置問題 (影響 8+ 測試)
4. **低優先級**: API 測試邏輯優化 (影響 4+ 測試)

### 📞 需要幫助？

- 查看 [完整修復計劃](./README.md)
- 參考 [詳細任務文件](./task-14.1-missing-modules.md)
- 檢查 [測試配置指南](./task-14.2-test-configuration.md)

---

**提示**: 建議先執行緊急修復，然後再進行完整的系統性修復。這樣可以快速提升測試通過率，同時為後續完整修復奠定基礎。