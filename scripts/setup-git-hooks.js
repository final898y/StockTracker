#!/usr/bin/env node
/**
 * 設置 Git Hooks 腳本
 * 自動安裝 commit 訊息驗證 hook
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const gitHooksDir = path.join(projectRoot, '.git', 'hooks');
const sourceHookPath = path.join(projectRoot, '.githooks', 'commit-msg');
const targetHookPath = path.join(gitHooksDir, 'commit-msg');

console.log('🔧 設置 Git Commit 驗證 Hook...');

try {
    // 檢查 .git 目錄是否存在
    if (!fs.existsSync(gitHooksDir)) {
        console.error('❌ 錯誤：找不到 .git/hooks 目錄');
        console.error('請確保在 Git 專案根目錄執行此腳本');
        process.exit(1);
    }

    // 複製 hook 檔案
    if (fs.existsSync(sourceHookPath)) {
        fs.copyFileSync(sourceHookPath, targetHookPath);
        
        // 在 Unix 系統上設置執行權限
        if (process.platform !== 'win32') {
            fs.chmodSync(targetHookPath, '755');
        }
        
        console.log('✅ Commit 訊息驗證 Hook 已安裝');
    } else {
        console.error('❌ 錯誤：找不到 hook 源檔案');
        process.exit(1);
    }

    // 設置 commit 模板
    try {
        execSync('git config commit.template .gitmessage', { cwd: projectRoot });
        console.log('✅ Git commit 模板已設置');
    } catch (error) {
        console.warn('⚠️  警告：無法設置 commit 模板');
    }

    console.log('');
    console.log('🎉 Git Hooks 設置完成！');
    console.log('');
    console.log('現在所有 commit 都會自動驗證格式：');
    console.log('- 必須使用 feat(task-X): 格式');
    console.log('- 建議使用中文描述');
    console.log('- 包含對應需求和相關檔案');
    console.log('');
    console.log('範例格式：');
    console.log('feat(task-3): 建立IndexedDB資料存儲服務');

} catch (error) {
    console.error('❌ 設置過程中發生錯誤：', error.message);
    process.exit(1);
}