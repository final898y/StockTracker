#!/usr/bin/env node

/**
 * 自動文檔生成腳本
 * 在任務完成後自動生成任務文檔和Git提交記錄
 */

const fs = require('fs');
const path = require('path');

class AutoDocGenerator {
  constructor() {
    this.docsDir = path.join(__dirname, '../docs');
    this.tasksDir = path.join(this.docsDir, 'tasks');
    this.commitsDir = path.join(this.docsDir, 'git-commits');
    this.templatesDir = path.join(this.docsDir, 'templates');
  }

  /**
   * 檢查任務是否已完成並需要生成文檔
   */
  async checkCompletedTasks() {
    try {
      const specsPath = path.join(__dirname, '../.kiro/specs/stock-tracker/tasks.md');
      if (!fs.existsSync(specsPath)) {
        console.log('❌ 找不到 specs/tasks.md 文件');
        return [];
      }

      const tasksContent = fs.readFileSync(specsPath, 'utf8');
      const completedTasks = this.extractCompletedTasks(tasksContent);
      
      if (completedTasks.length === 0) {
        console.log('ℹ️  沒有發現需要生成文檔的新完成任務');
        return [];
      }
      
      console.log(`✅ 找到 ${completedTasks.length} 個需要生成文檔的已完成任務`);
      
      const generatedTasks = [];
      for (const task of completedTasks) {
        const success = await this.generateTaskDocumentation(task);
        if (success) {
          generatedTasks.push(task);
        }
      }
      
      return generatedTasks;
      
    } catch (error) {
      console.error('❌ 檢查任務時發生錯誤:', error.message);
      return [];
    }
  }

  /**
   * 從 tasks.md 中提取已完成的任務
   */
  extractCompletedTasks(content) {
    const completedTasks = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 匹配已完成的任務 [x] 或 [✓]
      const taskMatch = line.match(/^- \[x\]|\[✓\]\s+(\d+)\.?\s*(.+)/i);
      if (taskMatch) {
        const taskNumber = taskMatch[1];
        const taskTitle = taskMatch[2];
        
        // 檢查是否已有文檔
        const taskDocPath = path.join(this.tasksDir, `task-${taskNumber}-${this.kebabCase(taskTitle)}.md`);
        if (!fs.existsSync(taskDocPath)) {
          completedTasks.push({
            number: taskNumber,
            title: taskTitle,
            description: this.extractTaskDescription(lines, i)
          });
        }
      }
    }
    
    return completedTasks;
  }

  /**
   * 提取任務描述
   */
  extractTaskDescription(lines, startIndex) {
    let description = '';
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- [') || line.startsWith('- [ ]') || line.startsWith('- [x]')) {
        break;
      }
      if (line.startsWith('-') && line.includes('Requirements:')) {
        break;
      }
      if (line) {
        description += line + ' ';
      }
    }
    return description.trim();
  }

  /**
   * 生成任務文檔
   */
  async generateTaskDocumentation(task) {
    try {
      console.log(`📝 為任務 ${task.number} 生成文檔: ${task.title}`);
      
      // 生成任務文檔
      await this.generateTaskDocument(task);
      
      // 生成Git提交記錄
      await this.generateCommitDocument(task);
      
      console.log(`✅ 任務 ${task.number} 文檔生成完成`);
      return true;
      
    } catch (error) {
      console.error(`❌ 生成任務 ${task.number} 文檔時發生錯誤:`, error.message);
      return false;
    }
  }

  /**
   * 生成任務文檔
   */
  async generateTaskDocument(task) {
    const templatePath = path.join(this.templatesDir, 'task-template.md');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    const fileName = `task-${task.number}-${this.kebabCase(task.title)}.md`;
    const filePath = path.join(this.tasksDir, fileName);
    
    const content = template
      .replace(/{TASK_NUMBER}/g, task.number)
      .replace(/{TASK_TITLE}/g, task.title)
      .replace(/{TASK_DESCRIPTION}/g, task.description)
      .replace(/{COMPLETION_DATE}/g, new Date().toISOString().split('T')[0])
      .replace(/{COMPLETION_TIME}/g, '自動生成')
      .replace(/{REQUIREMENTS}/g, '待補充')
      .replace(/{GENERATION_TIMESTAMP}/g, new Date().toISOString());
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📄 已生成任務文檔: ${fileName}`);
  }

  /**
   * 生成Git提交記錄
   */
  async generateCommitDocument(task) {
    const templatePath = path.join(this.templatesDir, 'git-commit-template.md');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    const fileName = `task-${task.number}-commits.md`;
    const filePath = path.join(this.commitsDir, fileName);
    
    const content = template
      .replace(/{TASK_NUMBER}/g, task.number)
      .replace(/{TASK_TITLE}/g, task.title)
      .replace(/{COMPLETION_DATE}/g, new Date().toISOString().split('T')[0])
      .replace(/{GENERATION_TIMESTAMP}/g, new Date().toISOString());
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📄 已生成Git提交記錄: ${fileName}`);
  }

  /**
   * 轉換為kebab-case格式
   */
  kebabCase(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/[\s_]+/g, '-') // 空格和下劃線轉為連字符
      .replace(/^-+|-+$/g, ''); // 移除開頭和結尾的連字符
  }

  /**
   * 確保目錄存在
   */
  ensureDirectories() {
    const dirs = [this.docsDir, this.tasksDir, this.commitsDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 已創建目錄: ${dir}`);
      }
    });
  }
}

// 主執行函數
async function main() {
  console.log('🚀 開始自動文檔生成...');
  
  const generator = new AutoDocGenerator();
  generator.ensureDirectories();
  const generatedTasks = await generator.checkCompletedTasks();
  
  if (generatedTasks.length > 0) {
    console.log(`✅ 自動文檔生成完成，共生成 ${generatedTasks.length} 個任務的文檔`);
    // 返回成功狀態碼
    process.exit(0);
  } else {
    console.log('ℹ️  沒有需要生成的新文檔');
    // 返回成功狀態碼（沒有錯誤）
    process.exit(0);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 自動文檔生成失敗:', error);
    process.exit(1);
  });
}

module.exports = { AutoDocGenerator };