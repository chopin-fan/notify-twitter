const { TwitterApi } = require('twitter-api-v2')
const https = require('https')

// 你的测试凭证
const config = {
  appKey: "XQ2Csl2hcG4R1S5YtYHxIJLhS",
  appSecret: "7XscNGjwuMA83JuDlDMpsWEc2Q298NRBa3evdn1vsNYgFbvJCP", 
  accessToken: "1932234031439245312-lqodRLrv0pmSxNysICYOgex8FB7sa4",
  accessSecret: "Vrlaz7kYIQIB3hjrumzEegFV75PqU9uENuedJy7cBi3Jc"
}

// 创建自定义HTTPS代理，解决网络超时问题
const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 60000,        // 60秒超时
  maxSockets: 10,
  maxFreeSockets: 5,
  scheduling: 'fifo'
})

console.log('🔧 使用修复版本的Twitter测试...\n')

async function testWithFixedSettings() {
  console.log('🛠️  使用修复的网络设置测试...')
  
  try {
    // 创建带有自定义网络设置的客户端
    const client = new TwitterApi(config, {
      timeout: 30000,  // 30秒超时
      agent: httpsAgent,
      retries: 3,      // 重试3次
    })
    
    console.log('✅ Twitter客户端创建成功')
    
    const rwClient = client.readWrite
    console.log('📡 开始发送API请求...')
    
    // 获取用户信息
    const me = await rwClient.v2.me()
    
    console.log('🎉 API请求成功!')
    console.log(`👤 用户: @${me.data.username} (${me.data.name})`)
    console.log(`📊 用户ID: ${me.data.id}`)
    
    // 发送测试推文
    const message = `🧪 网络修复测试成功！- ${new Date().toLocaleString('zh-CN')}

这条推文来自修复网络问题后的本地测试 ✨
#测试成功 #网络修复 #TwitterAPI`

    console.log('\n📝 准备发送测试推文...')
    console.log(`消息: ${message}`)
    console.log(`字符数: ${message.length}/280`)
    
    const tweet = await rwClient.v2.tweet(message)
    
    console.log('\n🎉 推文发送成功!')
    console.log(`🔗 推文链接: https://twitter.com/${me.data.username}/status/${tweet.data.id}`)
    console.log(`📄 推文ID: ${tweet.data.id}`)
    
    return true
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    
    if (error.data) {
      console.error('📄 详细错误:', JSON.stringify(error.data, null, 2))
    }
    
    // 提供具体的错误处理建议
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.error('\n💡 网络超时解决建议:')
      console.error('1. 检查网络代理设置')
      console.error('2. 尝试使用手机热点')
      console.error('3. 联系网络管理员检查防火墙')
      console.error('4. 尝试在不同时间段测试')
    }
    
    return false
  }
}

// 备用方案：使用系统curl命令
async function fallbackWithCurl() {
  console.log('\n🔄 尝试备用方案 (使用系统curl)...')
  
  const { exec } = require('child_process')
  const { promisify } = require('util')
  const execAsync = promisify(exec)
  
  try {
    // 构造OAuth 1.0a认证头（简化版本）
    const message = `🔧 备用方案测试 - ${new Date().toLocaleString('zh-CN')}`
    
    console.log('⚠️  备用方案需要手动实现OAuth签名，这里只是演示网络连接')
    console.log('如果需要完整实现，建议使用修复后的Node.js版本')
    
    // 测试基本连接
    const { stdout, stderr } = await execAsync('curl -s -I https://api.twitter.com/2/users/me')
    
    if (stdout.includes('HTTP/2 401') || stdout.includes('HTTP/1.1 401')) {
      console.log('✅ 系统curl可以正常连接到Twitter API')
      console.log('💡 建议：网络连接正常，问题在于Node.js配置')
      return true
    } else {
      console.log('❌ 系统curl也无法连接')
      return false
    }
    
  } catch (error) {
    console.error('❌ 备用方案失败:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 开始修复版本测试\n')
  
  // 显示网络诊断信息
  console.log('📋 当前环境信息:')
  console.log(`   Node.js版本: ${process.version}`)
  console.log(`   平台: ${process.platform}`)
  console.log(`   代理设置: ${process.env.HTTP_PROXY || process.env.HTTPS_PROXY || '无'}`)
  
  // 尝试修复版本
  const success = await testWithFixedSettings()
  
  if (!success) {
    // 如果修复版本失败，尝试备用方案
    await fallbackWithCurl()
    
    console.log('\n💡 最终建议:')
    console.log('1. 如果curl可以工作，问题在于Node.js网络配置')
    console.log('2. 尝试更新Node.js版本')
    console.log('3. 检查是否有企业防火墙或代理')
    console.log('4. 尝试在不同网络环境下测试')
    console.log('5. 联系系统管理员检查网络限制')
  }
  
  console.log('\n🏁 测试完成!')
}

if (require.main === module) {
  main()
} 