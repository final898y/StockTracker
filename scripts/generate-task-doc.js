#!/usr/bin/env node

/**
 * 任務文件自動生成腳本
 * 用於在任務完成後自動生成詳細的實作文件和Git提交記錄
 */

const fs = require('fs');
const path = require('path');

class TaskDocumentationGenerator {
  constructor() {
    this.docsDir = path.join(process.cwd(), 'docs');
    this.tasksDir = path.join(this.docsDir, 'tasks');
    this.commitsDir = path.join(this.docsDir, 'git-commits');
    this.templatesDir = path.join(this.docsDir, 'templates');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.tasksDir, this.commitsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 生成任務文件
   * @param {Object} taskData - 任務資料
   */
  generateTaskDocument(taskData) {
    const {
      taskNumber,
      taskTitle,
      description,
      requirements,
      implementationSteps,
      createdFiles,
      modifiedFiles,
      technicalDecisions,
      testResults,
      problems,
      followUpTasks
    } = taskData;

    const template = fs.readFileSync(
      path.join(this.templatesDir, 'task-template.md'),
      'utf8'
    );

    const completionDate = new Date().toLocaleDateString('zh-TW');
    const completionTime = new Date().toLocaleTimeString('zh-TW');
    const generationTimestamp = new Date().toISOString();

    let document = template
      .replace(/{TASK_NUMBER}/g, taskNumber)
      .replace(/{TASK_TITLE}/g, taskTitle)
      .replace(/{COMPLETION_DATE}/g, completionDate)
      .replace(/{COMPLETION_TIME}/g, completionTime)
      .replace(/{REQUIREMENTS}/g, requirements.join(', '))
      .replace(/{TASK_DESCRIPTION}/g, description)
      .replace(/{GENERATION_TIMESTAMP}/g, generationTimestamp);

    // 替換實作步驟
    if (implementationSteps && implementationSteps.length > 0) {
      const stepsContent = implementationSteps.map((step, index) => `
### 步驟 ${index + 1}: ${step.title}
${step.description}

**實作內容:**
${step.implementation.map(item => `- ${item}`).join('\n')}

**技術決策:**
${step.decisions.map(decision => `- ${decision}`).join('\n')}
      `).join('\n');
      
      document = document.replace(/### 步驟 1:.*?### 步驟 2:.*/s, stepsContent);
    }

    // 替換檔案清單
    if (createdFiles && createdFiles.length > 0) {
      const createdFilesContent = createdFiles.map(file => 
        `- \`${file.path}\` - ${file.description}`
      ).join('\n');
      document = document.replace(/## 建立的檔案\n- `{FILE_PATH_1}`.*?## 修改的檔案/s, 
        `## 建立的檔案\n${createdFilesContent}\n\n## 修改的檔案`);
    }

    if (modifiedFiles && modifiedFiles.length > 0) {
      const modifiedFilesContent = modifiedFiles.map(file => 
        `- \`${file.path}\` - ${file.description}`
      ).join('\n');
      document = document.replace(/## 修改的檔案\n- `{MODIFIED_FILE_1}`.*?## 技術決策和理由/s, 
        `## 修改的檔案\n${modifiedFilesContent}\n\n## 技術決策和理由`);
    }

    // 寫入檔案
    const fileName = `task-${taskNumber.toString().padStart(2, '0')}-${this.kebabCase(taskTitle)}.md`;
    const filePath = path.join(this.tasksDir, fileName);
    
    fs.writeFileSync(filePath, document, 'utf8');
    console.log(`✅ 任務文件已生成: ${fileName}`);
    
    return filePath;
  }

  /**
   * 生成Git提交記錄文件
   * @param {Object} commitData - 提交資料
   */
  generateCommitDocument(commitData) {
    const {
      taskNumber,
      taskTitle,
      commits,
      requirements
    } = commitData;

    const template = fs.readFileSync(
      path.join(this.templatesDir, 'git-commit-template.md'),
      'utf8'
    );

    const completionDate = new Date().toLocaleDateString('zh-TW');
    const generationTimestamp = new Date().toISOString();

    let document = template
      .replace(/{TASK_NUMBER}/g, taskNumber)
      .replace(/{TASK_TITLE}/g, taskTitle)
      .replace(/{COMPLETION_DATE}/g, completionDate)
      .replace(/{REQUIREMENT_NUMBERS}/g, requirements.join(', '))
      .replace(/{GENERATION_TIMESTAMP}/g, generationTimestamp);

    // 替換提交記錄
    if (commits && commits.length > 0) {
      const commitsContent = commits.map((commit, index) => `
### 提交 ${index + 1}: ${commit.title}
\`\`\`bash
git add ${commit.files.join(' ')}
git commit -m "feat(task-${taskNumber}): ${commit.message}

- ${commit.details.join('\n- ')}
- 對應需求: Requirement ${commit.requirements.join(', ')}
- 相關檔案: ${commit.files.join(', ')}

Co-authored-by: AI Assistant <ai@kiro.dev>"
\`\`\`

**變更內容:**
${commit.changes.map(change => `- ${change}`).join('\n')}
      `).join('\n');
      
      document = document.replace(/### 提交 1:.*?### 提交 2:.*/s, commitsContent);
    }

    // 寫入檔案
    const fileName = `task-${taskNumber.toString().padStart(2, '0')}-commits.md`;
    const filePath = path.join(this.commitsDir, fileName);
    
    fs.writeFileSync(filePath, document, 'utf8');
    console.log(`✅ Git提交記錄已生成: ${fileName}`);
    
    return filePath;
  }

  /**
   * 更新開發日誌
   * @param {Object} logData - 日誌資料
   */
  updateDevelopmentLog(logData) {
    const {
      taskNumber,
      taskTitle,
      status,
      mainAchievements,
      technicalDecisions
    } = logData;

    const logPath = path.join(this.docsDir, 'development-log.md');
    let logContent = fs.readFileSync(logPath, 'utf8');

    const today = new Date().toLocaleDateString('zh-TW');
    const taskEntry = `
#### 任務 ${taskNumber}: ${taskTitle} ✅
- **狀態**: ${status}
- **文件**: [task-${taskNumber.toString().padStart(2, '0')}-${this.kebabCase(taskTitle)}.md](tasks/task-${taskNumber.toString().padStart(2, '0')}-${this.kebabCase(taskTitle)}.md)
- **Git記錄**: [task-${taskNumber.toString().padStart(2, '0')}-commits.md](git-commits/task-${taskNumber.toString().padStart(2, '0')}-commits.md)
- **主要成果**: 
${mainAchievements.map(achievement => `  - ${achievement}`).join('\n')}
`;

    // 在任務完成記錄區域新增條目
    const dateSection = `### ${today}`;
    if (logContent.includes(dateSection)) {
      // 如果今天的日期區域已存在，在其後新增任務
      logContent = logContent.replace(
        new RegExp(`(${dateSection}[\\s\\S]*?)(?=###|$)`),
        `$1${taskEntry}\n`
      );
    } else {
      // 建立新的日期區域
      const newDateSection = `${dateSection}${taskEntry}\n`;
      logContent = logContent.replace(
        /## 任務完成記錄\n\n/,
        `## 任務完成記錄\n\n${newDateSection}`
      );
    }

    // 更新進度總覽
    logContent = logContent.replace(
      new RegExp(`- \\[ \\] ${taskNumber}\\. ${taskTitle}`),
      `- [x] ${taskNumber}. ${taskTitle}`
    );

    // 更新最後修改時間
    const updateTime = new Date().toLocaleDateString('zh-TW');
    logContent = logContent.replace(
      /\*最後更新: .*?\*/,
      `*最後更新: ${updateTime}*`
    );

    fs.writeFileSync(logPath, logContent, 'utf8');
    console.log(`✅ 開發日誌已更新`);
  }

  /**
   * 轉換為kebab-case格式
   * @param {string} str - 輸入字串
   * @returns {string} kebab-case格式字串
   */
  kebabCase(str) {
    return str
      .replace(/[\u4e00-\u9fff]/g, '') // 移除中文字符
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-'); // 空格轉為連字符
  }

  /**
   * 生成完整的任務文件套件
   * @param {Object} fullTaskData - 完整任務資料
   */
  generateFullDocumentation(fullTaskData) {
    console.log(`🚀 開始生成任務 ${fullTaskData.taskNumber} 的文件...`);
    
    // 生成任務文件
    this.generateTaskDocument(fullTaskData.task);
    
    // 生成Git提交記錄
    this.generateCommitDocument(fullTaskData.commits);
    
    // 更新開發日誌
    this.updateDevelopmentLog(fullTaskData.log);
    
    console.log(`✅ 任務 ${fullTaskData.taskNumber} 的所有文件已生成完成！`);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const generator = new TaskDocumentationGenerator();
  
  // 範例使用方式
  const exampleTaskData = {
    taskNumber: 16,
    task: {
      taskNumber: 16,
      taskTitle: '建立任務文件化系統',
      description: '建立完整的任務文件化系統，包含文件模板、自動生成機制和開發日誌追蹤。',
      requirements: ['8.1', '8.2', '8.3', '8.4', '8.5'],
      implementationSteps: [
        {
          title: '建立文件目錄結構',
          description: '建立docs目錄和子目錄結構',
          implementation: [
            '建立docs/目錄',
            '建立tasks/、git-commits/、templates/子目錄',
            '建立README.md說明文件'
          ],
          decisions: [
            '使用Markdown格式便於版本控制',
            '分離任務文件和Git記錄便於管理'
          ]
        }
      ],
      createdFiles: [
        { path: 'docs/README.md', description: '文件系統說明' },
        { path: 'docs/templates/task-template.md', description: '任務文件模板' },
        { path: 'docs/templates/git-commit-template.md', description: 'Git提交記錄模板' },
        { path: 'docs/development-log.md', description: '開發日誌' },
        { path: 'scripts/generate-task-doc.js', description: '文件自動生成腳本' }
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
      commits: []
    },
    log: {
      taskNumber: 16,
      taskTitle: '建立任務文件化系統',
      status: '已完成',
      mainAchievements: [
        '建立完整的文件目錄結構',
        '建立任務和Git提交記錄模板',
        '實作自動文件生成腳本',
        '建立開發日誌追蹤系統'
      ],
      technicalDecisions: []
    }
  };
  
  console.log('📚 任務文件化系統已建立完成！');
  console.log('使用方式:');
  console.log('const generator = new TaskDocumentationGenerator();');
  console.log('generator.generateFullDocumentation(taskData);');
}

module.exports = TaskDocumentationGenerator;