# 任務文件化系統使用指南

## 概覽

任務文件化系統是為股票追蹤專案設計的自動化文件生成工具，幫助開發者記錄每個任務的實作過程、技術決策和Git提交記錄。

## 系統架構

```
docs/
├── README.md                    # 系統說明
├── usage-guide.md              # 使用指南（本文件）
├── git-commit-standards.md     # Git提交規範
├── development-log.md           # 開發日誌總覽
├── tasks/                       # 任務詳細文件
│   ├── task-01-project-setup.md
│   ├── task-02-data-models.md
│   └── ...
├── git-commits/                 # Git提交記錄
│   ├── task-01-commits.md
│   ├── task-02-commits.md
│   └── ...
└── templates/                   # 文件模板
    ├── task-template.md
    └── git-commit-template.md

scripts/
├── generate-task-doc.js         # 文件生成核心邏輯
└── task-doc-cli.js             # 命令列介面工具
```

## 快速開始

### 1. 使用命令列工具（推薦）

```bash
# 啟動互動式CLI
npm run doc

# 或直接執行
node scripts/task-doc-cli.js
```

### 2. 程式化使用

```javascript
const TaskDocumentationGenerator = require('./scripts/generate-task-doc');

const generator = new TaskDocumentationGenerator();
generator.generateFullDocumentation(taskData);
```

## 詳細使用方法

### 互動式CLI使用

1. **啟動CLI**
   ```bash
   npm run doc
   ```

2. **選擇操作**
   - 選項 1: 生成任務文件
   - 選項 2: 更新開發日誌
   - 選項 3: 查看使用說明

3. **輸入任務資訊**
   - 任務編號（如：16）
   - 任務標題（如：建立任務文件化系統）
   - 任務描述
   - 對應需求編號（用逗號分隔）

4. **輸入實作步驟**
   - 步驟標題
   - 步驟描述
   - 實作內容（用分號分隔）
   - 技術決策（用分號分隔）

5. **輸入檔案資訊**
   - 格式：`檔案路徑|檔案描述`
   - 範例：`docs/README.md|系統說明文件`

6. **輸入主要成果**
   - 列出任務完成的主要成果

### 程式化使用

```javascript
const TaskDocumentationGenerator = require('./scripts/generate-task-doc');

// 建立生成器實例
const generator = new TaskDocumentationGenerator();

// 準備任務資料
const taskData = {
  taskNumber: 16,
  task: {
    taskNumber: 16,
    taskTitle: '建立任務文件化系統',
    description: '建立完整的任務文件化系統...',
    requirements: ['8.1', '8.2', '8.3', '8.4', '8.5'],
    implementationSteps: [
      {
        title: '建立文件目錄結構',
        description: '建立docs目錄和子目錄結構',
        implementation: [
          '建立docs/目錄',
          '建立子目錄結構'
        ],
        decisions: [
          '使用Markdown格式',
          '分離不同類型文件'
        ]
      }
    ],
    createdFiles: [
      { path: 'docs/README.md', description: '系統說明' }
    ],
    modifiedFiles: [],
    technicalDecisions: [],
    testResults: [],
    problems: [],
    followUpTasks: []
  },
  commits: {
    taskNumber: 16,
    taskTitle: '建立任務文件化系統',
    requirements: ['8.1', '8.2', '8.3', '8.4', '8.5'],
    commits: [
      {
        title: '建立文件系統基礎架構',
        message: '建立docs目錄結構和基本模板',
        details: [
          '建立docs目錄和子目錄',
          '建立任務文件模板',
          '建立Git提交記錄模板'
        ],
        requirements: ['8.1', '8.2'],
        files: ['docs/', 'scripts/'],
        changes: [
          '新增文件目錄結構',
          '建立文件模板系統'
        ]
      }
    ]
  },
  log: {
    taskNumber: 16,
    taskTitle: '建立任務文件化系統',
    status: '已完成',
    mainAchievements: [
      '建立完整的文件目錄結構',
      '實作自動文件生成機制'
    ],
    technicalDecisions: []
  }
};

// 生成完整文件
generator.generateFullDocumentation(taskData);
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

## 最佳實踐

### 1. 任務完成後立即記錄
- 在任務完成後立即生成文件
- 記憶猶新時記錄更準確

### 2. 詳細記錄技術決策
- 記錄為什麼選擇某個技術方案
- 記錄考慮過的替代方案
- 記錄決策的影響和後果

### 3. 記錄遇到的問題
- 詳細描述問題的現象
- 記錄解決問題的過程
- 記錄學到的經驗教訓

### 4. 保持Git提交規範
- 遵循標準的提交訊息格式
- 包含對應的需求編號
- 使用有意義的提交描述

### 5. 定期更新開發日誌
- 保持開發日誌的即時性
- 記錄專案的整體進度
- 記錄重要的里程碑

## 常見問題

### Q: 如何修改已生成的文件？
A: 直接編輯對應的Markdown文件即可，系統不會覆蓋已存在的文件。

### Q: 如何自訂文件模板？
A: 修改 `docs/templates/` 目錄下的模板文件，系統會使用更新後的模板。

### Q: 如何批次生成多個任務的文件？
A: 可以編寫腳本調用 `generateFullDocumentation()` 方法，傳入多個任務資料。

### Q: 文件生成失敗怎麼辦？
A: 檢查任務資料格式是否正確，確保必要的欄位都有值。查看控制台錯誤訊息。

### Q: 如何整合到CI/CD流程？
A: 可以在Git hooks或CI腳本中調用文件生成功能，自動化文件更新。

## 擴展功能

### 1. 自動化整合
```javascript
// 在Git hooks中使用
const generator = new TaskDocumentationGenerator();

// 從Git提交訊息解析任務資訊
const taskInfo = parseCommitMessage(commitMessage);
generator.updateDevelopmentLog(taskInfo);
```

### 2. 報告生成
```javascript
// 生成專案進度報告
const generator = new TaskDocumentationGenerator();
generator.generateProgressReport();
```

### 3. 統計分析
```javascript
// 分析任務完成統計
const stats = generator.getTaskStatistics();
console.log(`已完成任務: ${stats.completed}`);
console.log(`平均完成時間: ${stats.averageTime}`);
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
*此指南是股票追蹤系統任務文件化系統的完整使用說明*
*最後更新: 2025-01-18*