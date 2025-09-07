---
inclusion: always
---

# Git Commit 標準約束規則

## 🚨 重要約束：必須使用中文 Commit 訊息

這個專案**必須使用中文 commit 訊息**，絕對不可以使用英文。

## 支援的提交格式

### 1. 任務相關提交（推薦用於功能開發）
```
feat(task-X): 中文標題

中文詳細說明
- 具體實作內容 1
- 具體實作內容 2
- 對應需求: X.X, X.X
- 相關檔案: path/to/files

Co-authored-by: AI Assistant <ai@kiro/Gemini.dev>
```

### 2. 一般提交（用於系統級變更）
```
feat: 中文標題

中文詳細說明
- 具體變更內容 1
- 具體變更內容 2
- 相關檔案: path/to/files

Co-authored-by: AI Assistant <ai@kiro/Gemini.dev>
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

## 必要格式要素

### 任務相關提交必須包含：
1. **類型前綴**: `feat(task-X):`, `fix(task-X):`, `docs(task-X):` 等
2. **中文標題**: 簡潔的中文描述
3. **中文詳細說明**: 使用條列式中文說明
4. **對應需求**: `對應需求: X.X, X.X`（必須，格式如：1.2, 1.3, 2.2, 8.1, 8.2, 8.3, 8.4, 8.5）
5. **相關檔案**: `相關檔案: path/to/files`
6. **協作標籤**: `Co-authored-by: AI Assistant <ai@kiro.dev>`（必須完全一致）

### 一般提交必須包含：
1. **類型前綴**: `feat:`, `fix:`, `refactor:` 等
2. **中文標題**: 簡潔的中文描述
3. **中文詳細說明**: 使用條列式中文說明
4. **相關檔案**: `相關檔案: path/to/files`
5. **協作標籤**: `Co-authored-by: AI Assistant <ai@kiro.dev>`

## 🔥 每次執行必須遵循的檢查清單

### Git 提交前檢查
- [ ] **絕對使用中文**標題和描述
- [ ] 包含正確的類型前綴格式
- [ ] 任務相關提交必須包含對應需求編號
- [ ] 包含相關檔案清單
- [ ] 包含 `Co-authored-by: AI Assistant <ai@kiro.dev>` 標籤
- [ ] 詳細說明使用條列式格式
- [ ] 標題長度不超過50字元
- [ ] 詳細說明每行不超過72字元

## 自動化約束機制

### 已建立的約束層級
1. **Kiro Steering 規則**: AI 助手會自動遵循此規則
2. **Git Commit 模板**: 提供標準格式模板和提醒
3. **Commit Hook 驗證**: 自動驗證 commit 格式
4. **檢查腳本**: 格式檢查和驗證工具

### 設置步驟
1. 安裝 Git Hooks: `npm run setup:hooks`
2. 檢查現有格式: `npm run commit:check`
3. 驗證設置: `git commit -m "test: 測試格式驗證"`
