#!/usr/bin/env node

/**
 * 任務文件化系統命令列工具
 * 提供簡單的CLI介面來生成任務文件
 */

const TaskDocumentationGenerator = require('./generate-task-doc');
const readline = require('readline');

class TaskDocCLI {
  constructor() {
    this.generator = new TaskDocumentationGenerator();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 啟動互動式CLI
   */
  async start() {
    console.log('📚 任務文件化系統 CLI');
    console.log('====================');
    console.log('');
    
    try {
      const action = await this.askQuestion('請選擇操作:\n1. 生成任務文件\n2. 更新開發日誌\n3. 查看使用說明\n請輸入選項 (1-3): ');
      
      switch (action.trim()) {
        case '1':
          await this.generateTaskDoc();
          break;
        case '2':
          await this.updateDevLog();
          break;
        case '3':
          this.showHelp();
          break;
        default:
          console.log('❌ 無效的選項');
      }
    } catch (error) {
      console.error('❌ 發生錯誤:', error.message);
    } finally {
      this.rl.close();
    }
  }

  /**
   * 生成任務文件的互動流程
   */
  async generateTaskDoc() {
    console.log('\n📝 生成任務文件');
    console.log('================');
    
    const taskNumber = await this.askQuestion('任務編號: ');
    const taskTitle = await this.askQuestion('任務標題: ');
    const description = await this.askQuestion('任務描述: ');
    const requirements = await this.askQuestion('對應需求 (用逗號分隔): ');
    
    console.log('\n請輸入實作步驟 (輸入空行結束):');
    const steps = await this.collectSteps();
    
    console.log('\n請輸入建立的檔案 (格式: 路徑|描述，輸入空行結束):');
    const createdFiles = await this.collectFiles();
    
    console.log('\n請輸入主要成果 (輸入空行結束):');
    const achievements = await this.collectAchievements();

    const taskData = {
      taskNumber: parseInt(taskNumber),
      task: {
        taskNumber: parseInt(taskNumber),
        taskTitle,
        description,
        requirements: requirements.split(',').map(r => r.trim()),
        implementationSteps: steps,
        createdFiles,
        modifiedFiles: [],
        technicalDecisions: [],
        testResults: [],
        problems: [],
        followUpTasks: []
      },
      commits: {
        taskNumber: parseInt(taskNumber),
        taskTitle,
        requirements: requirements.split(',').map(r => r.trim()),
        commits: []
      },
      log: {
        taskNumber: parseInt(taskNumber),
        taskTitle,
        status: '已完成',
        mainAchievements: achievements,
        technicalDecisions: []
      }
    };

    this.generator.generateFullDocumentation(taskData);
    console.log('\n✅ 任務文件生成完成！');
  }

  /**
   * 收集實作步驟
   */
  async collectSteps() {
    const steps = [];
    let stepNumber = 1;
    
    while (true) {
      const stepTitle = await this.askQuestion(`步驟 ${stepNumber} 標題 (空行結束): `);
      if (!stepTitle.trim()) break;
      
      const stepDesc = await this.askQuestion(`步驟 ${stepNumber} 描述: `);
      const implementation = await this.askQuestion(`實作內容 (用分號分隔): `);
      const decisions = await this.askQuestion(`技術決策 (用分號分隔): `);
      
      steps.push({
        title: stepTitle,
        description: stepDesc,
        implementation: implementation.split(';').map(i => i.trim()).filter(i => i),
        decisions: decisions.split(';').map(d => d.trim()).filter(d => d)
      });
      
      stepNumber++;
    }
    
    return steps;
  }

  /**
   * 收集檔案資訊
   */
  async collectFiles() {
    const files = [];
    
    while (true) {
      const fileInfo = await this.askQuestion('檔案資訊 (路徑|描述，空行結束): ');
      if (!fileInfo.trim()) break;
      
      const [path, description] = fileInfo.split('|').map(s => s.trim());
      if (path && description) {
        files.push({ path, description });
      }
    }
    
    return files;
  }

  /**
   * 收集主要成果
   */
  async collectAchievements() {
    const achievements = [];
    
    while (true) {
      const achievement = await this.askQuestion('主要成果 (空行結束): ');
      if (!achievement.trim()) break;
      achievements.push(achievement);
    }
    
    return achievements;
  }

  /**
   * 更新開發日誌
   */
  async updateDevLog() {
    console.log('\n📊 更新開發日誌');
    console.log('================');
    
    const taskNumber = await this.askQuestion('任務編號: ');
    const taskTitle = await this.askQuestion('任務標題: ');
    const status = await this.askQuestion('任務狀態: ');
    
    console.log('\n請輸入主要成果 (輸入空行結束):');
    const achievements = await this.collectAchievements();

    const logData = {
      taskNumber: parseInt(taskNumber),
      taskTitle,
      status,
      mainAchievements: achievements,
      technicalDecisions: []
    };

    this.generator.updateDevelopmentLog(logData);
    console.log('\n✅ 開發日誌更新完成！');
  }

  /**
   * 顯示使用說明
   */
  showHelp() {
    console.log('\n📖 使用說明');
    console.log('============');
    console.log('');
    console.log('1. 生成任務文件:');
    console.log('   - 根據提示輸入任務資訊');
    console.log('   - 系統會自動生成任務文件和Git提交記錄');
    console.log('   - 同時更新開發日誌');
    console.log('');
    console.log('2. 更新開發日誌:');
    console.log('   - 單獨更新開發日誌中的任務記錄');
    console.log('   - 適用於快速記錄任務完成狀態');
    console.log('');
    console.log('3. 檔案結構:');
    console.log('   - docs/tasks/ - 任務詳細文件');
    console.log('   - docs/git-commits/ - Git提交記錄');
    console.log('   - docs/development-log.md - 開發日誌總覽');
    console.log('');
    console.log('4. 程式化使用:');
    console.log('   const generator = new TaskDocumentationGenerator();');
    console.log('   generator.generateFullDocumentation(taskData);');
    console.log('');
  }

  /**
   * 詢問問題並等待回答
   */
  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const cli = new TaskDocCLI();
  cli.start().catch(console.error);
}

module.exports = TaskDocCLI;