const { sendTweet } = require('./local-twitter.js')

// 设置你的凭证
process.env.TWITTER_APP_KEY = "XQ2Csl2hcG4R1S5YtYHxIJLhS"
process.env.TWITTER_APP_SECRET = "7XscNGjwuMA83JuDlDMpsWEc2Q298NRBa3evdn1vsNYgFbvJCP"
process.env.TWITTER_ACCESS_TOKEN = "1932234031439245312-lqodRLrv0pmSxNysICYOgex8FB7sa4"
process.env.TWITTER_ACCESS_TOKEN_SECRET = "Vrlaz7kYIQIB3hjrumzEegFV75PqU9uENuedJy7cBi3Jc"

async function quickTest() {
    console.log('🚀 快速测试开始...')
    
    try {
        const message = `🧪 快速测试推文 - ${new Date().toLocaleString('zh-CN')}
        
这是来自 GitHub Action Notify Twitter 项目的测试！✨
#测试 #TwitterAPI #本地开发`

        console.log('📝 准备发送推文...')
        console.log('消息:', message)
        console.log('字符数:', message.length)
        
        await sendTweet(message)
        
        console.log('🎉 测试成功完成!')
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message)
        
        // 显示更详细的错误信息
        if (error.code) {
            console.error('错误代码:', error.code)
        }
        if (error.data) {
            console.error('详细错误:', JSON.stringify(error.data, null, 2))
        }
    }
}

quickTest() 