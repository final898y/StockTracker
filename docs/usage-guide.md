# 任務文件化系統使用指南

## 概覽

任務文件化系統採用 AI 驅動的文件生成方式，為股票追蹤專案自動記錄每個任務的實作過程、技術決策和Git提交記錄。

## 系統架構

```
docs/
├── README.md                    # 系統說明
├── usage-guide.md              # 使用指南（本文件）
├── git-commit-standards.md     # Git提交規範
├── development-log.md           # 開發日誌總覽
├── tasks/                       # 任務詳細文件
│   ├── task-01-project-setup.md
│   ├── task-07-core-ui-components.md
│   └── ...
├── git-commits/                 # Git提交記錄
│   ├── task-01-commits.md
│   ├── task-07-commits.md
│   └── ...
└── templates/                   # 文件模板
    ├── task-template.md
    └── git-commit-template.md

scripts/
└── generate-task-doc.js         # 文件生成核心邏輯
```

## AI 驅動的文件生成

### 1. 任務完成後的自動文件生成

AI 會在任務完成後自動：
- 分析程式碼變更和實作內容
- 生成詳細的任務完成文件
- 建立標準化的 Git 提交記錄
- 更新開發日誌和專案進度

### 2. 程式化使用

```javascript
const TaskDocumentationGenerator = require('./scripts/generate-task-doc');

const generator = new TaskDocumentationGenerator();
generator.generateFullDocumentation(taskData);
```

## AI 文件生成流程

### 任務分析階段
1. **程式碼變更分析**: AI 自動分析新增、修改的檔案
2. **實作內容識別**: 識別核心功能和技術實作
3. **需求對應**: 自動對應實作內容到需求編號
4. **技術決策記錄**: 分析並記錄重要的技術選擇

### 文件生成階段
1. **任務文件生成**: 基於模板自動生成詳細文件
2. **Git 提交記錄**: 生成標準化的提交記錄模板
3. **開發日誌更新**: 自動更新專案整體進度
4. **交叉引用**: 建立文件間的關聯和引用

### AI 智能分析範例

AI 會自動分析任務實作內容，例如：

```javascript
// AI 自動識別的任務資料結構
const aiGeneratedTaskData = {
  taskNumber: 7,
  taskTitle: '實作核心UI組件',
  description: 'AI 分析: 實作搜尋功能、追蹤清單和狀態管理組件',
  requirements: ['1.1', '1.2', '2.1', '2.2', '4.3', '8.1'], // AI 自動對應
  implementationSteps: [
    {
      title: 'AI 識別: 建立搜尋功能組件',
      description: 'AI 分析程式碼發現實作了統一搜尋介面',
      implementation: [
        'SearchBar 組件 - 搜尋輸入框',
        'SearchResults 組件 - 結果顯示',
        'SearchSuggestions 組件 - 搜尋建議'
      ],
      decisions: [
        'AI 分析: 選擇 lucide-react 作為圖示庫',
        'AI 分析: 使用響應式設計支援行動裝置'
      ]
    }
  ],
  createdFiles: [
    // AI 自動掃描新增的檔案
    { path: 'src/components/search/SearchBar.tsx', description: 'AI 識別: 搜尋輸入框組件' },
    { path: 'src/components/watchlist/WatchlistTable.tsx', description: 'AI 識別: 追蹤清單表格' }
  ],
  technicalDecisions: [
    // AI 分析程式碼中的技術決策
    'AI 分析: 採用 Tailwind CSS 實作響應式設計',
    'AI 分析: 整合 Zustand store 進行狀態管理'
  ]
};
```

## 文件模板說明

### 任務文件模板

任務文件包含以下區段：
- **基本資訊**: 任務編號、標題、完成日期等
- **任務描述**: 任務的詳細說明
- **實作步驟**: 具體的實作過程
- **建立/修改的檔案**: 檔案變更記錄
- **技術決策和理由**: 重要的技術選擇
- **測試結果和驗證**: 測試記錄
- **遇到的問題和解決方案**: 問題排除記錄
- **Git提交記錄**: 相關的Git提交
- **後續工作**: 未來的相關任務

### Git提交記錄模板

Git提交記錄包含：
- **任務資訊**: 基本任務資料
- **Git提交標準格式**: 標準化的提交格式
- **實際提交記錄**: 具體的提交命令和內容
- **提交類型說明**: 不同類型提交的說明
- **分支策略**: 分支命名和合併策略

## AI 文件生成的優勢

### 1. 自動化程度高
- AI 自動分析程式碼變更
- 無需手動輸入大量資訊
- 自動識別技術決策和實作細節

### 2. 一致性和標準化
- 統一的文件格式和結構
- 標準化的 Git 提交訊息
- 自動對應需求和實作內容

### 3. 智能分析能力
- 識別程式碼中的設計模式
- 分析技術選擇的合理性
- 自動生成測試覆蓋報告

### 4. 即時性和準確性
- 任務完成後立即生成文件
- 基於實際程式碼變更的準確記錄
- 減少人為記錄錯誤

### 5. 可擴展性
- 支援不同類型的任務和專案
- 可自訂文件模板和格式
- 支援多語言和國際化

## 最佳實踐

### 1. 保持程式碼清晰
- 使用有意義的變數和函數名稱
- 添加適當的註解和文檔
- 遵循一致的程式碼風格

### 2. 遵循 Git 提交規範
- 使用標準化的提交訊息格式
- 包含對應的需求編號
- 提供清晰的變更描述

### 3. 及時更新文件
- 在任務完成後立即生成文件
- 定期檢查和更新文件內容
- 保持文件與程式碼的同步

### 4. 善用 AI 分析結果
- 檢查 AI 生成的技術決策記錄
- 補充 AI 可能遺漏的重要資訊
- 驗證 AI 分析的準確性

## 常見問題

### Q: AI 生成的文件準確嗎？
A: AI 基於實際程式碼變更生成文件，準確性很高。建議在生成後進行檢查和補充。

### Q: 如何自訂 AI 分析的重點？
A: 可以透過程式碼註解和文檔字串引導 AI 關注特定的技術決策和實作細節。

### Q: AI 能識別所有的技術決策嗎？
A: AI 能識別大部分明顯的技術決策，但可能需要人工補充一些隱含的決策理由。

### Q: 如何處理 AI 分析錯誤？
A: 直接編輯生成的 Markdown 文件進行修正，AI 不會覆蓋已存在的文件。

### Q: 能否批次處理多個任務？
A: 可以，AI 支援批次分析多個任務的程式碼變更並生成對應文件。

## AI 擴展功能

### 1. 智能程式碼分析
```javascript
// AI 自動分析程式碼品質和設計模式
const aiAnalysis = {
  codeQuality: 'AI 分析: 程式碼遵循 SOLID 原則',
  designPatterns: ['Observer Pattern', 'Factory Pattern'],
  testCoverage: 'AI 檢測: 85% 測試覆蓋率',
  performance: 'AI 建議: 可優化載入效能'
};
```

### 2. 自動化報告生成
```javascript
// AI 生成專案進度和品質報告
const aiReport = {
  completedTasks: 7,
  codeQuality: 'A+',
  testCoverage: '85%',
  technicalDebt: 'Low',
  recommendations: [
    'AI 建議: 增加 E2E 測試',
    'AI 建議: 優化組件載入效能'
  ]
};
```

### 3. 智能建議系統
```javascript
// AI 基於程式碼分析提供改進建議
const aiSuggestions = {
  nextTasks: [
    'AI 建議: 實作使用者認證系統',
    'AI 建議: 添加資料視覺化功能'
  ],
  codeImprovements: [
    'AI 建議: 重構重複的樣式代碼',
    'AI 建議: 增加錯誤邊界處理'
  ],
  performanceOptimizations: [
    'AI 建議: 實作虛擬滾動',
    'AI 建議: 使用 React.memo 優化渲染'
  ]
};
```

## 技術細節

### 檔案命名規則
- 任務文件: `task-{編號}-{kebab-case標題}.md`
- Git記錄: `task-{編號}-commits.md`
- 編號使用兩位數格式（如：01, 02, 16）

### 模板變數替換
系統使用 `{VARIABLE_NAME}` 格式的變數，在生成時會被實際值替換。

### 錯誤處理
- 檔案寫入失敗會顯示錯誤訊息
- 模板檔案不存在會使用預設模板
- 無效的任務資料會被忽略

---
*此指南是股票追蹤系統 AI 驅動文件化系統的完整使用說明*
*最後更新: 2025-01-24*