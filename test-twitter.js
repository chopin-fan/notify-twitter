#!/usr/bin/env node

// 测试 Twitter API 配置脚本
const { TwitterApi } = require('twitter-api-v2')

// 你的测试凭证
const config = {
  appKey: "XQ2Csl2hcG4R1S5YtYHxIJLhS",
  appSecret: "7XscNGjwuMA83JuDlDMpsWEc2Q298NRBa3evdn1vsNYgFbvJCP", 
  accessToken: "1932234031439245312-lqodRLrv0pmSxNysICYOgex8FB7sa4",
  accessSecret: "Vrlaz7kYIQIB3hjrumzEegFV75PqU9uENuedJy7cBi3Jc"
}

async function testTwitterConnection() {
  console.log('🧪 开始测试 Twitter API 连接...\n')
  
  try {
    console.log('🔐 验证凭证...')
    const client = new TwitterApi(config)
    const rwClient = client.readWrite
    
    // 测试连接 - 获取用户信息
    console.log('👤 获取用户信息...')
    const me = await rwClient.v2.me()
    console.log(`✅ 连接成功! 用户: @${me.data.username} (${me.data.name})`)
    console.log(`📊 用户ID: ${me.data.id}`)
    
    return true
    
  } catch (error) {
    console.error('❌ 连接失败!')
    console.error('错误详情:', error.message)
    if (error.data) {
      console.error('API 响应:', JSON.stringify(error.data, null, 2))
    }
    return false
  }
}

async function sendTestTweet() {
  console.log('\n🐦 发送测试推文...')
  
  try {
    const client = new TwitterApi(config)
    const rwClient = client.readWrite
    
    const testMessage = `🧪 测试推文 - ${new Date().toLocaleString('zh-CN')} 
    
这是来自本地开发环境的测试推文！ #测试 #GitHub #TwitterAPI`
    
    console.log(`📝 推文内容: ${testMessage}`)
    console.log(`📏 字符数: ${testMessage.length}/280`)
    
    const tweet = await rwClient.v2.tweet(testMessage)
    
    console.log('✅ 推文发送成功!')
    console.log(`🔗 推文链接: https://twitter.com/user/status/${tweet.data.id}`)
    console.log(`📄 推文ID: ${tweet.data.id}`)
    
    return tweet
    
  } catch (error) {
    console.error('❌ 推文发送失败!')
    console.error('错误详情:', error.message)
    if (error.data) {
      console.error('API 响应:', JSON.stringify(error.data, null, 2))
    }
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 Twitter API 测试工具

用法:
  node test-twitter.js [选项]

选项:
  --connection-only    只测试连接，不发送推文
  --send-tweet        测试连接并发送测试推文 (默认)
  --help, -h          显示帮助信息

示例:
  node test-twitter.js                    # 完整测试
  node test-twitter.js --connection-only  # 只测试连接
`)
    return
  }
  
  console.log('🚀 Twitter API 测试开始\n')
  
  // 测试连接
  const connected = await testTwitterConnection()
  
  if (!connected) {
    console.log('\n❌ 测试失败 - 无法连接到 Twitter API')
    process.exit(1)
  }
  
  // 是否发送测试推文
  if (!args.includes('--connection-only')) {
    try {
      await sendTestTweet()
      console.log('\n🎉 所有测试通过!')
    } catch (error) {
      console.log('\n❌ 推文发送测试失败')
      process.exit(1)
    }
  } else {
    console.log('\n✅ 连接测试通过!')
  }
  
  console.log('\n⚠️  重要提醒: 测试完成后请到 Twitter Developer Portal 重新生成 API 密钥!')
}

if (require.main === module) {
  main()
}

module.exports = { testTwitterConnection, sendTestTweet } 