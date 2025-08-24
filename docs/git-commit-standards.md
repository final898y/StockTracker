# Git 提交標準和規範

## 提交訊息格式

### 支援的格式

#### 1. 任務相關提交（推薦）
```
<type>(task-<number>): <簡短描述>

<詳細說明>
- 具體實作內容 1
- 具體實作內容 2
- 對應需求: <需求編號>
- 相關檔案: <檔案清單>

Co-authored-by: AI Assistant <ai@kiro.dev>
```

#### 2. 一般提交（系統級變更）
```
<type>: <簡短描述>

<詳細說明>
- 具體變更內容 1
- 具體變更內容 2
- 相關檔案: <檔案清單>

Co-authored-by: AI Assistant <ai@kiro.dev>
```

### 範例

#### 任務相關提交
```
feat(task-16): 建立任務文件化系統

建立完整的任務文件化系統，包含自動生成機制和模板
- 建立docs目錄結構和文件模板
- 實作任務完成後的自動文件生成機制
- 建立Git commit標準格式和範例
- 創建開發日誌追蹤系統
- 對應需求: 8.1, 8.2, 8.3, 8.4, 8.5
- 相關檔案: docs/, scripts/generate-task-doc.js

Co-authored-by: AI Assistant <ai@kiro.dev>
```

#### 一般提交（重構、系統變更）
```
refactor: 移除CLI工具改用AI驅動文件生成系統

簡化文件生成工作流程，提高效率和準確性
- 刪除task-doc-cli.js互動式命令列工具
- 更新design.md改為AI驅動的文件生成說明
- 重寫usage-guide.md為AI驅動的使用指南
- 移除package.json中相關的npm scripts
- 相關檔案: scripts/, docs/, .kiro/specs/, package.json

Co-authored-by: AI Assistant <ai@kiro.dev>
```

## 提交類型 (Type)

### 任務相關類型
- `feat(task-XX)`: 新功能實作
- `fix(task-XX)`: 錯誤修復
- `refactor(task-XX)`: 程式碼重構（不改變功能）
- `test(task-XX)`: 新增或修改測試
- `docs(task-XX)`: 文件更新
- `style(task-XX)`: 程式碼格式調整（不影響功能）
- `chore(task-XX)`: 建置工具或輔助工具變動
- `perf(task-XX)`: 效能優化

### 一般類型（系統級變更）
- `feat`: 新功能或系統功能
- `fix`: 系統錯誤修復
- `refactor`: 系統重構或架構調整
- `test`: 測試系統或框架變更
- `docs`: 系統文件或規範更新
- `style`: 全域樣式或格式調整
- `chore`: 建置系統或工具鏈變更
- `perf`: 系統效能優化

### 特殊類型
- `init`: 專案初始化
- `config`: 配置檔案變更
- `deps`: 依賴套件更新

## 提交訊息規則

### 第一行（標題）
- 長度限制：50字元以內
- 使用現在式動詞（如：新增、修復、更新）
- 不以句號結尾
- 簡潔明確描述變更內容

### 詳細說明
- 與標題間空一行
- 每行長度限制：72字元以內
- 說明變更的原因和內容
- 使用條列式說明具體實作內容

### 必要資訊
- **對應需求**: 必須標明對應的需求編號
- **相關檔案**: 列出主要變更的檔案
- **Co-authored-by**: 標明AI協作

## 分支命名規範

### 功能分支
```
task-<編號>-<簡短描述>
```

範例：
- `task-16-documentation-system`
- `task-03-indexeddb-service`
- `task-07-ui-components`

### 其他分支類型
- `hotfix-<描述>`: 緊急修復
- `refactor-<描述>`: 重構分支
- `experiment-<描述>`: 實驗性功能

## 提交頻率建議

### 建議提交時機
1. 完成一個完整的功能模組
2. 修復一個特定問題
3. 完成一組相關的檔案變更
4. 達到一個可測試的狀態

### 避免的提交方式
- 過於頻繁的小提交
- 包含多個不相關變更的大提交
- 提交訊息不清楚的提交
- 包含未完成功能的提交

## 合併策略

### 主分支合併
- 使用 `Squash and merge`
- 保持主分支歷史清潔
- 合併前確保所有測試通過

### 合併提交訊息
```
feat(task-XX): <任務標題> (#PR編號)

<任務完整描述>
- 主要功能點 1
- 主要功能點 2
- 對應需求: Requirement X.X, X.X
```

## 標籤 (Tags) 規範

### 版本標籤
- 格式：`v<major>.<minor>.<patch>`
- 範例：`v1.0.0`, `v1.1.0`, `v1.1.1`

### 里程碑標籤
- 格式：`milestone-<描述>`
- 範例：`milestone-mvp`, `milestone-beta`

## 提交檢查清單

### 提交前檢查
- [ ] 程式碼已通過本地測試
- [ ] 提交訊息符合格式規範
- [ ] 包含對應的需求編號
- [ ] 相關檔案清單正確
- [ ] 沒有包含敏感資訊
- [ ] 程式碼格式已統一

### 合併前檢查
- [ ] 所有自動化測試通過
- [ ] 程式碼審查完成
- [ ] 文件已更新
- [ ] 變更日誌已記錄

## 工具和自動化

### Git Hooks
建議設定以下Git hooks：
- `pre-commit`: 程式碼格式檢查
- `commit-msg`: 提交訊息格式驗證
- `pre-push`: 執行測試套件

### 提交訊息模板
在專案根目錄建立 `.gitmessage` 檔案：
```
# <type>(task-<number>): <簡短描述>
# 
# <詳細說明>
# - 具體實作內容
# - 對應需求: Requirement 
# - 相關檔案: 
# 
# Co-authored-by: AI Assistant <ai@kiro.dev>
```

設定Git使用模板：
```bash
git config commit.template .gitmessage
```

## 常見問題和解決方案

### Q: 如何修改最後一次提交訊息？
```bash
git commit --amend -m "新的提交訊息"
```

### Q: 如何合併多個小提交？
```bash
git rebase -i HEAD~<提交數量>
```

### Q: 如何撤銷最後一次提交？
```bash
# 保留變更
git reset --soft HEAD~1

# 丟棄變更
git reset --hard HEAD~1
```

### Q: 如何查看提交歷史？
```bash
# 簡潔格式
git log --oneline

# 詳細格式
git log --graph --pretty=format:'%h - %an, %ar : %s'
```

---
*此文件是股票追蹤系統開發規範的一部分*
*最後更新: 2025-01-18*
##
 自動化約束機制

### 已建立的約束層級

#### 1. Kiro Steering 規則
- 位置：`.kiro/steering/commit-standards.md`
- 作用：AI 助手會自動遵循此規則
- 內容：強制要求使用中文 commit 訊息

#### 2. Git Commit 模板
- 位置：`.gitmessage`
- 作用：提供標準格式模板和提醒
- 設定：`git config commit.template .gitmessage`

#### 3. Commit Hook 驗證
- 位置：`.githooks/commit-msg`
- 作用：自動驗證 commit 格式
- 安裝：`npm run setup:hooks`

#### 4. 檢查腳本
- 格式檢查：`npm run commit:check`
- 詳細檢查：`node scripts/check-commit-format.js`

### 設置步驟

1. **安裝 Git Hooks**：
   ```bash
   npm run setup:hooks
   ```

2. **檢查現有格式**：
   ```bash
   npm run commit:check
   ```

3. **驗證設置**：
   ```bash
   git commit -m "test: 測試格式驗證"
   ```

### 多層防護機制

1. **AI 層級**：Kiro Steering 規則約束 AI 行為
2. **模板層級**：Git 模板提供格式提醒
3. **驗證層級**：Commit Hook 自動格式檢查
4. **檢查層級**：腳本工具驗證歷史記錄

這樣可以確保從多個角度防止格式錯誤的發生。