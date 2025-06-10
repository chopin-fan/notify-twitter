const { TwitterApi } = require('twitter-api-v2')

// 你的测试凭证
const config = {
  appKey: "XQ2Csl2hcG4R1S5YtYHxIJLhS",
  appSecret: "7XscNGjwuMA83JuDlDMpsWEc2Q298NRBa3evdn1vsNYgFbvJCP", 
  accessToken: "1932234031439245312-lqodRLrv0pmSxNysICYOgex8FB7sa4",
  accessSecret: "Vrlaz7kYIQIB3hjrumzEegFV75PqU9uENuedJy7cBi3Jc"
}

async function debugTwitterConnection() {
  console.log('🔍 开始详细调试...')
  console.log('📋 使用的凭证:')
  console.log(`   App Key: ${config.appKey.substring(0, 10)}...`)
  console.log(`   App Secret: ${config.appSecret.substring(0, 10)}...`) 
  console.log(`   Access Token: ${config.accessToken.substring(0, 20)}...`)
  console.log(`   Access Secret: ${config.accessSecret.substring(0, 10)}...`)
  
  try {
    console.log('\n🔧 初始化 Twitter 客户端...')
    
    // 创建客户端时添加超时设置
    const client = new TwitterApi(config, {
      timeout: 30000, // 30秒超时
    })
    
    console.log('✅ 客户端创建成功')
    
    const rwClient = client.readWrite
    console.log('✅ 读写客户端创建成功')
    
    // 设置超时Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时 (30秒)')), 30000)
    })
    
    console.log('\n🌐 开始API请求...')
    console.log('📍 API端点: https://api.twitter.com/2/users/me')
    
    // 使用Promise.race来设置超时
    const me = await Promise.race([
      rwClient.v2.me(),
      timeoutPromise
    ])
    
    console.log('✅ API请求成功!')
    console.log(`👤 用户信息: @${me.data.username} (${me.data.name})`)
    console.log(`📊 用户ID: ${me.data.id}`)
    
    return true
    
  } catch (error) {
    console.error('\n❌ 请求失败!')
    console.error('错误类型:', error.constructor.name)
    console.error('错误消息:', error.message)
    
    // 详细的错误分析
    if (error.code) {
      console.error('错误代码:', error.code)
    }
    
    if (error.statusCode) {
      console.error('HTTP状态码:', error.statusCode)
    }
    
    if (error.data) {
      console.error('API响应详情:', JSON.stringify(error.data, null, 2))
    }
    
    if (error.errors) {
      console.error('具体错误:', error.errors)
    }
    
    // 网络相关错误分析
    if (error.message.includes('timeout')) {
      console.error('\n🔍 网络超时问题:')
      console.error('   - 检查网络连接')
      console.error('   - 检查是否能访问 api.twitter.com')
      console.error('   - 检查防火墙设置')
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n🔍 DNS/连接问题:')
      console.error('   - 检查DNS设置') 
      console.error('   - 检查网络代理')
      console.error('   - 尝试: ping api.twitter.com')
    }
    
    if (error.statusCode === 401) {
      console.error('\n🔍 认证问题:')
      console.error('   - 检查API密钥是否正确')
      console.error('   - 检查应用权限设置')
      console.error('   - 确认账户状态正常')
    }
    
    if (error.statusCode === 403) {
      console.error('\n🔍 权限问题:')
      console.error('   - 检查应用是否有读取权限')
      console.error('   - 检查开发者账户状态')
      console.error('   - 确认API密钥未过期')
    }
    
    return false
  }
}

async function testSimpleRequest() {
  console.log('\n🧪 测试简单请求...')
  
  try {
    const client = new TwitterApi(config)
    
    // 手动构造请求来测试连接
    console.log('📡 发送测试请求到 Twitter API...')
    
    // 使用更底层的方法测试
    const response = await client.v2.get('users/me', {}, {
      timeout: 15000
    })
    
    console.log('✅ 底层请求成功!')
    console.log('响应数据:', response)
    
  } catch (error) {
    console.error('❌ 底层请求失败:', error.message)
    
    // 如果是网络问题，提供解决建议
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 建议解决方案:')
      console.error('1. 检查网络连接')
      console.error('2. 尝试使用手机热点测试')
      console.error('3. 检查代理设置')
      console.error('4. 运行: curl -I https://api.twitter.com/2/users/me')
    }
  }
}

async function checkNetworkConnectivity() {
  console.log('\n🌐 检查网络连接...')
  
  try {
    const https = require('https')
    
    const testConnection = () => new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.twitter.com',
        port: 443,
        path: '/2/users/me',
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${process.env.BEARER_TOKEN || 'test'}`
        }
      }, (res) => {
        console.log(`✅ 连接成功! 状态码: ${res.statusCode}`)
        console.log(`📋 响应头:`, res.headers)
        resolve(res.statusCode)
      })
      
      req.on('timeout', () => {
        console.error('❌ 连接超时')
        reject(new Error('连接超时'))
      })
      
      req.on('error', (error) => {
        console.error('❌ 连接错误:', error.message)
        reject(error)
      })
      
      req.end()
    })
    
    await testConnection()
    
  } catch (error) {
    console.error('❌ 网络连接测试失败:', error.message)
    console.error('\n🔧 请尝试以下诊断命令:')
    console.error('   curl -I https://api.twitter.com/2/users/me')
    console.error('   nslookup api.twitter.com')
    console.error('   ping api.twitter.com')
  }
}

async function main() {
  console.log('🚀 Twitter API 详细调试开始\n')
  
  // 1. 检查网络连接
  await checkNetworkConnectivity()
  
  // 2. 测试Twitter API连接
  await debugTwitterConnection()
  
  // 3. 测试简单请求
  await testSimpleRequest()
  
  console.log('\n🏁 调试完成!')
  console.log('\n⚠️  如果仍然有问题，请提供上面的调试信息')
}

if (require.main === module) {
  main()
} 