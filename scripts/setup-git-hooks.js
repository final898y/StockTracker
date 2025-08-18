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
const sourceCommitMsgHookPath = path.join(projectRoot, '.githooks', 'commit-msg');
const sourcePreCommitHookPath = path.join(projectRoot, '.githooks', 'pre-commit');
const targetCommitMsgHookPath = path.join(gitHooksDir, 'commit-msg');
const targetPreCommitHookPath = path.join(gitHooksDir, 'pre-commit');

console.log('🔧 設置 Git Commit 驗證 Hook...');

try {
    // 檢查 .git 目錄是否存在
    if (!fs.existsSync(gitHooksDir)) {
        console.error('❌ 錯誤：找不到 .git/hooks 目錄');
        console.error('請確保在 Git 專案根目錄執行此腳本');
        process.exit(1);
    }

    // 複製 commit-msg hook
    if (fs.existsSync(sourceCommitMsgHookPath)) {
        fs.copyFileSync(sourceCommitMsgHookPath, targetCommitMsgHookPath);
        
        // 在 Unix 系統上設置執行權限
        if (process.platform !== 'win32') {
            fs.chmodSync(targetCommitMsgHookPath, '755');
        }
        
        console.log('✅ Commit 訊息驗證 Hook 已安裝');
    } else {
        console.warn('⚠️  警告：找不到 commit-msg hook 源檔案');
    }

    // 複製 pre-commit hook
    if (fs.existsSync(sourcePreCommitHookPath)) {
        fs.copyFileSync(sourcePreCommitHookPath, targetPreCommitHookPath);
        
        // 在 Unix 系統上設置執行權限
        if (process.platform !== 'win32') {
            fs.chmodSync(targetPreCommitHookPath, '755');
        }
        
        console.log('✅ Pre-commit 自動文檔生成 Hook 已安裝');
    } else {
        console.warn('⚠️  警告：找不到 pre-commit hook 源檔案');
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
    console.log('現在所有 commit 都會自動：');
    console.log('- 驗證 commit 訊息格式（必須使用 feat(task-X): 格式）');
    console.log('- 檢查已完成任務並自動生成文檔');
    console.log('- 將生成的文檔自動加入到 commit 中');
    console.log('');
    console.log('範例格式：');
    console.log('feat(task-3): 建立IndexedDB資料存儲服務');

} catch (error) {
    console.error('❌ 設置過程中發生錯誤：', error.message);
    process.exit(1);
}