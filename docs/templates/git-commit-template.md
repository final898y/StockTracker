# 任務 {TASK_NUMBER} Git 提交記錄

## 任務資訊
- **任務編號**: {TASK_NUMBER}
- **任務標題**: {TASK_TITLE}
- **完成日期**: {COMPLETION_DATE}

## Git 提交標準格式

### 主要提交格式
```
feat(task-{TASK_NUMBER}): {簡短描述}

- 詳細說明實作內容
- 對應需求: Requirement {REQUIREMENT_NUMBERS}
- 相關檔案: {FILE_LIST}

Co-authored-by: AI Assistant <ai@kiro.dev>
```

## 實際提交記錄

### 提交 1: {COMMIT_TITLE}
```bash
git add {FILES}
git commit -m "feat(task-{TASK_NUMBER}): {COMMIT_MESSAGE}

- {DETAILED_DESCRIPTION_1}
- {DETAILED_DESCRIPTION_2}
- 對應需求: Requirement {REQUIREMENTS}
- 相關檔案: {FILE_LIST}

Co-authored-by: AI Assistant <ai@kiro.dev>"
```

**變更內容:**
- {CHANGE_DESCRIPTION_1}
- {CHANGE_DESCRIPTION_2}

### 提交 2: {COMMIT_TITLE}
```bash
git add {FILES}
git commit -m "feat(task-{TASK_NUMBER}): {COMMIT_MESSAGE}

- {DETAILED_DESCRIPTION_1}
- {DETAILED_DESCRIPTION_2}
- 對應需求: Requirement {REQUIREMENTS}
- 相關檔案: {FILE_LIST}

Co-authored-by: AI Assistant <ai@kiro.dev>"
```

**變更內容:**
- {CHANGE_DESCRIPTION_1}
- {CHANGE_DESCRIPTION_2}

## 提交類型說明

### 提交類型前綴
- `feat(task-XX)`: 新功能實作
- `fix(task-XX)`: 錯誤修復
- `refactor(task-XX)`: 程式碼重構
- `test(task-XX)`: 測試相關
- `docs(task-XX)`: 文件更新
- `style(task-XX)`: 程式碼格式調整
- `chore(task-XX)`: 建置或輔助工具變動

### 提交訊息規範
1. 第一行：簡短描述（50字元以內）
2. 空行
3. 詳細說明（每行72字元以內）
4. 包含對應需求編號
5. 列出相關檔案
6. 包含Co-authored-by標籤

## 分支策略
- 主分支: `main`
- 功能分支: `task-{TASK_NUMBER}-{description}`
- 合併方式: Squash and merge

---
*此文件由任務文件化系統自動生成於 {GENERATION_TIMESTAMP}*