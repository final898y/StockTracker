#!/usr/bin/env node
/**
 * 檢查最近的 commit 格式是否符合標準
 */

const { execSync } = require('child_process');

console.log('🔍 檢查最近的 commit 格式...\n');

try {
    // 獲取最近 5 個 commit
    const commits = execSync('git log --oneline -5', { encoding: 'utf8' });
    const commitLines = commits.trim().split('\n');
    
    console.log('最近的 commit 記錄：');
    console.log('==================');
    
    let allValid = true;
    const validPattern = /^[a-f0-9]+ (feat|fix|docs|style|refactor|test|chore|perf)\(task-\d+\):/;
    
    commitLines.forEach((line, index) => {
        const isValid = validPattern.test(line);
        const status = isValid ? '✅' : '❌';
        const hasChineseChars = /[一-龯]/.test(line);
        const langStatus = hasChineseChars ? '🇹🇼' : '🇺🇸';
        
        console.log(`${status} ${langStatus} ${line}`);
        
        if (!isValid) {
            allValid = false;
        }
    });
    
    console.log('\n格式說明：');
    console.log('✅ = 格式正確');
    console.log('❌ = 格式錯誤');
    console.log('🇹🇼 = 包含中文');
    console.log('🇺🇸 = 僅英文');
    
    if (allValid) {
        console.log('\n🎉 所有 commit 格式都正確！');
    } else {
        console.log('\n⚠️  發現格式不正確的 commit');
        console.log('\n正確格式應該是：');
        console.log('feat(task-X): 中文標題');
        console.log('\n範例：');
        console.log('feat(task-3): 建立IndexedDB資料存儲服務');
        console.log('fix(task-5): 修復價格更新問題');
        console.log('docs(task-1): 更新API文檔');
    }
    
} catch (error) {
    console.error('❌ 無法獲取 commit 歷史：', error.message);
    process.exit(1);
}