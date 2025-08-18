# Git 提交標準和規範

## 提交訊息格式

### 標準格式
```
<type>(task-<number>): <簡短描述>

<詳細說明>
- 具體實作內容 1
- 具體實作內容 2
- 對應需求: Requirement <需求編號>
- 相關檔案: <檔案清單>

Co-authored-by: AI Assistant <ai@kiro.dev>
```

### 範例
```
feat(task-16): 建立任務文件化系統

建立完整的任務文件化系統，包含自動生成機制和模板
- 建立docs目錄結構和文件模板
- 實作任務完成後的自動文件生成機制
- 建立Git commit標準格式和範例
- 創建開發日誌追蹤系統
- 對應需求: Requirement 8.1, 8.2, 8.3, 8.4, 8.5
- 相關檔案: docs/, scripts/generate-task-doc.js

Co-authored-by: AI Assistant <ai@kiro.dev>
```

## 提交類型 (Type)

### 主要類型
- `feat(task-XX)`: 新功能實作
- `fix(task-XX)`: 錯誤修復
- `refactor(task-XX)`: 程式碼重構（不改變功能）
- `test(task-XX)`: 新增或修改測試
- `docs(task-XX)`: 文件更新
- `style(task-XX)`: 程式碼格式調整（不影響功能）
- `chore(task-XX)`: 建置工具或輔助工具變動
- `perf(task-XX)`: 效能優化

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