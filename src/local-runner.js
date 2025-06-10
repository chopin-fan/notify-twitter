// 本地运行器 - 模拟 GitHub Actions 环境
const path = require('path')

// 模拟 @actions/core
const mockCore = {
  getInput: (name, options = {}) => {
    const envName = `INPUT_${name.toUpperCase().replace(/-/g, '_')}`
    const value = process.env[envName] || ''
    
    if (options.required && !value) {
      throw new Error(`Input required and not supplied: ${name}`)
    }
    
    if (options.trimWhitespace !== false) {
      return value.trim()
    }
    return value
  },
  
  info: (message) => console.log(`ℹ️  ${message}`),
  warning: (message) => console.warn(`⚠️  ${message}`),
  setFailed: (message) => {
    console.error(`❌ ${message}`)
    process.exit(1)
  }
}

// 模拟 actions-toolkit
const mockToolkit = {
  logActionRefWarning: () => {},
  logRepoWarning: () => {}
}

// 替换模块
require.cache[require.resolve('@actions/core')] = {
  exports: mockCore
}

require.cache[require.resolve('actions-toolkit')] = {
  exports: mockToolkit
}

// 导入并运行原始 action
const { run } = require('./action.js')

async function runLocal(options = {}) {
  // 设置输入环境变量
  if (options.message) process.env.INPUT_MESSAGE = options.message
  if (options.twitterAppKey) process.env.INPUT_TWITTER_APP_KEY = options.twitterAppKey
  if (options.twitterAppSecret) process.env.INPUT_TWITTER_APP_SECRET = options.twitterAppSecret
  if (options.twitterAccessToken) process.env.INPUT_TWITTER_ACCESS_TOKEN = options.twitterAccessToken
  if (options.twitterAccessTokenSecret) process.env.INPUT_TWITTER_ACCESS_TOKEN_SECRET = options.twitterAccessTokenSecret
  if (options.media) process.env.INPUT_MEDIA = Array.isArray(options.media) ? options.media.join('\n') : options.media
  if (options.mediaAltText) process.env.INPUT_MEDIA_ALT_TEXT = Array.isArray(options.mediaAltText) ? options.mediaAltText.join('\n') : options.mediaAltText
  
  try {
    await run()
    console.log('✅ 本地运行成功!')
  } catch (error) {
    console.error('❌ 本地运行失败:', error.message)
    process.exit(1)
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🏠 本地运行 GitHub Action

用法:
  node src/local-runner.js --message "消息内容" [选项]

选项:
  --message TEXT              推文消息 (必需)
  --media FILE1,FILE2         媒体文件路径，用逗号分隔
  --media-alt-text TEXT1,TEXT2 媒体文件 alt text，用逗号分隔

环境变量:
  TWITTER_APP_KEY
  TWITTER_APP_SECRET  
  TWITTER_ACCESS_TOKEN
  TWITTER_ACCESS_TOKEN_SECRET

示例:
  node src/local-runner.js --message "Hello World!"
  node src/local-runner.js --message "With image!" --media "./image.jpg"
`)
    process.exit(0)
  }
  
  const options = {
    twitterAppKey: process.env.TWITTER_APP_KEY,
    twitterAppSecret: process.env.TWITTER_APP_SECRET,
    twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN,
    twitterAccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  }
  
  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--message':
        options.message = args[++i]
        break
      case '--media':
        options.media = args[++i].split(',').map(s => s.trim())
        break
      case '--media-alt-text':
        options.mediaAltText = args[++i].split(',').map(s => s.trim())
        break
    }
  }
  
  if (!options.message) {
    console.error('❌ 需要提供 --message 参数')
    process.exit(1)
  }
  
  runLocal(options)
}

module.exports = { runLocal } 