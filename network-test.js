const https = require('https')
const { TwitterApi } = require('twitter-api-v2')

// 你的测试凭证
const config = {
  appKey: "XQ2Csl2hcG4R1S5YtYHxIJLhS",
  appSecret: "7XscNGjwuMA83JuDlDMpsWEc2Q298NRBa3evdn1vsNYgFbvJCP", 
  accessToken: "1932234031439245312-lqodRLrv0pmSxNysICYOgex8FB7sa4",
  accessSecret: "Vrlaz7kYIQIB3hjrumzEegFV75PqU9uENuedJy7cBi3Jc"
}

console.log('🔧 Node.js 网络诊断开始...\n')

// 测试1: 基本HTTPS连接
async function testBasicHttps() {
  console.log('1️⃣ 测试基本HTTPS连接到 api.twitter.com...')
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.twitter.com',
      port: 443,
      path: '/2/users/me',
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'test-app/1.0'
      }
    }, (res) => {
      console.log(`✅ HTTPS连接成功! 状态码: ${res.statusCode}`)
      console.log(`📋 Content-Type: ${res.headers['content-type']}`)
      
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log(`📄 响应长度: ${data.length} 字节`)
        if (data.length < 200) {
          console.log(`📄 响应内容: ${data}`)
        }
        resolve(res.statusCode)
      })
    })
    
    req.on('timeout', () => {
      console.error('❌ HTTPS请求超时')
      reject(new Error('HTTPS请求超时'))
    })
    
    req.on('error', (error) => {
      console.error('❌ HTTPS连接错误:', error.code, error.message)
      reject(error)
    })
    
    req.end()
  })
}

// 测试2: 使用twitter-api-v2但跳过认证
async function testTwitterLibrarySimple() {
  console.log('\n2️⃣ 测试 twitter-api-v2 库基本连接...')
  
  try {
    // 创建一个只有Bearer Token的简单客户端
    const client = new TwitterApi('fake_bearer_token')
    
    // 这应该会失败，但至少可以测试网络连接
    await client.v2.me()
    
  } catch (error) {
    if (error.code === 401 || error.data?.title === 'Unauthorized') {
      console.log('✅ 网络连接正常 (收到401认证错误，这是预期的)')
      return true
    } else {
      console.error('❌ 网络连接错误:', error.message)
      return false
    }
  }
}

// 测试3: 使用正确的凭证
async function testWithCredentials() {
  console.log('\n3️⃣ 测试使用正确凭证...')
  
  try {
    const client = new TwitterApi(config)
    const rwClient = client.readWrite
    
    // 设置较短的超时时间
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时 (10秒)')), 10000)
    })
    
    const me = await Promise.race([
      rwClient.v2.me(),
      timeoutPromise
    ])
    
    console.log('✅ API请求成功!')
    console.log(`👤 用户: @${me.data.username} (${me.data.name})`)
    return true
    
  } catch (error) {
    console.error('❌ API请求失败:', error.message)
    
    if (error.message.includes('timeout')) {
      console.error('🔍 这看起来像是网络超时问题')
    } else if (error.data) {
      console.error('📄 API错误详情:', JSON.stringify(error.data, null, 2))
    }
    return false
  }
}

// 测试4: 使用自定义HTTP代理设置
async function testWithProxy() {
  console.log('\n4️⃣ 测试代理和网络配置...')
  
  // 检查环境变量中的代理设置
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy
  
  if (httpProxy || httpsProxy) {
    console.log('🔍 检测到代理设置:')
    if (httpProxy) console.log(`   HTTP_PROXY: ${httpProxy}`)
    if (httpsProxy) console.log(`   HTTPS_PROXY: ${httpsProxy}`)
  } else {
    console.log('ℹ️  未检测到代理设置')
  }
  
  // 检查Node.js网络设置
  console.log('📋 Node.js网络配置:')
  console.log(`   Node版本: ${process.version}`)
  console.log(`   平台: ${process.platform}`)
  
  // 尝试设置一些网络选项
  try {
    const client = new TwitterApi(config, {
      timeout: 15000,
      // 禁用代理
      agent: false
    })
    
    const me = await client.readWrite.v2.me()
    console.log('✅ 使用自定义网络设置成功!')
    console.log(`👤 用户: @${me.data.username}`)
    return true
    
  } catch (error) {
    console.error('❌ 自定义网络设置失败:', error.message)
    return false
  }
}

async function main() {
  try {
    await testBasicHttps()
    await testTwitterLibrarySimple() 
    await testWithCredentials()
    await testWithProxy()
    
    console.log('\n🏁 网络诊断完成!')
    
  } catch (error) {
    console.error('\n💥 诊断过程中出现严重错误:', error.message)
  }
}

main() 