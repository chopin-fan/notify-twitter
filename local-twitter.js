#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2')
const fs = require('fs')
const path = require('path')

// 配置 Twitter API 凭证
const config = {
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}

async function uploadMedia(client, mediaPaths, mediaAltTexts = []) {
  if (!mediaPaths || mediaPaths.length === 0) return []
  
  console.log(`📁 上传媒体文件: ${mediaPaths.join(', ')}`)
  
  const mediaIds = await Promise.all(
    mediaPaths.map(mediaPath => {
      if (!fs.existsSync(mediaPath)) {
        throw new Error(`媒体文件不存在: ${mediaPath}`)
      }
      return client.v1.uploadMedia(mediaPath)
    })
  )
  
  console.log(`✅ 媒体上传完成 - IDs: ${mediaIds.join(', ')}`)
  
  // 添加 alt text
  if (mediaAltTexts && mediaAltTexts.length > 0) {
    try {
      await Promise.all(
        mediaIds.map((mediaId, index) => {
          const altText = mediaAltTexts[index]
          if (!altText || !altText.trim()) return Promise.resolve()
          
          console.log(`🏷️  添加 alt text - MediaID: ${mediaId}, Alt: ${altText}`)
          return client.v1.createMediaMetadata(mediaId, {
            alt_text: { text: altText }
          })
        })
      )
    } catch (err) {
      console.warn(`⚠️  Alt text 设置失败: ${err.message}`)
    }
  }
  
  return mediaIds
}

async function sendTweet(message, mediaPaths = [], mediaAltTexts = []) {
  const MAX_MESSAGE_LENGTH = 280
  
  // 验证配置
  if (!config.appKey || !config.appSecret || !config.accessToken || !config.accessSecret) {
    throw new Error('❌ 缺少 Twitter API 凭证，请设置环境变量:\nTWITTER_APP_KEY\nTWITTER_APP_SECRET\nTWITTER_ACCESS_TOKEN\nTWITTER_ACCESS_TOKEN_SECRET')
  }
  
  // 验证消息长度
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`❌ 消息太长！当前 ${message.length} 字符，最大 ${MAX_MESSAGE_LENGTH} 字符`)
  }
  
  console.log('🐦 初始化 Twitter 客户端...')
  const client = new TwitterApi(config)
  const rwClient = client.readWrite
  
  const tweetOpts = {}
  
  try {
    // 上传媒体文件
    if (mediaPaths.length > 0) {
      const mediaIds = await uploadMedia(rwClient, mediaPaths, mediaAltTexts)
      if (mediaIds.length > 0) {
        tweetOpts.media = { media_ids: mediaIds }
      }
    }
    
    // 发送推文
    console.log(`📝 发送推文: ${message}`)
    const tweet = await rwClient.v2.tweet(message, tweetOpts)
    
    console.log('✅ 推文发送成功!')
    console.log(`🔗 推文链接: https://twitter.com/user/status/${tweet.data.id}`)
    
    return tweet
    
  } catch (error) {
    console.error('❌ 发送失败:', error.message)
    if (error.data) {
      console.error('📄 详细错误:', JSON.stringify(error.data, null, 2))
    }
    throw error
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🐦 本地 Twitter 发送工具

用法:
  node local-twitter.js "消息内容" [媒体文件1] [媒体文件2] ...

环境变量:
  TWITTER_APP_KEY              Twitter API Key
  TWITTER_APP_SECRET           Twitter API Secret
  TWITTER_ACCESS_TOKEN         Twitter Access Token  
  TWITTER_ACCESS_TOKEN_SECRET  Twitter Access Token Secret

示例:
  # 发送简单消息
  node local-twitter.js "Hello from local!"
  
  # 发送带图片的消息
  node local-twitter.js "Check out this image!" ./image.jpg
  
  # 发送带多个媒体文件的消息
  node local-twitter.js "Multiple files!" ./img1.jpg ./img2.png

  # 使用环境变量文件
  TWITTER_APP_KEY=xxx TWITTER_APP_SECRET=xxx ... node local-twitter.js "Message"
`)
    return
  }
  
  const message = args[0]
  const mediaPaths = args.slice(1).filter(path => fs.existsSync(path))
  
  if (args.slice(1).length > 0 && mediaPaths.length === 0) {
    console.warn('⚠️  指定的媒体文件都不存在，将发送纯文本推文')
  }
  
  try {
    await sendTweet(message, mediaPaths)
  } catch (error) {
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { sendTweet, uploadMedia } 