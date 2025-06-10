#!/bin/bash

# Twitter API 测试配置脚本
# 运行方式: source test-config.sh

echo "🔧 配置 Twitter API 测试凭证..."

export TWITTER_APP_KEY="XQ2Csl2hcG4R1S5YtYHxIJLhS"
export TWITTER_APP_SECRET="7XscNGjwuMA83JuDlDMpsWEc2Q298NRBa3evdn1vsNYgFbvJCP"
export TWITTER_ACCESS_TOKEN="1932234031439245312-lqodRLrv0pmSxNysICYOgex8FB7sa4"
export TWITTER_ACCESS_TOKEN_SECRET="Vrlaz7kYIQIB3hjrumzEegFV75PqU9uENuedJy7cBi3Jc"

echo "✅ 环境变量已设置:"
echo "   TWITTER_APP_KEY: ${TWITTER_APP_KEY:0:10}..."
echo "   TWITTER_APP_SECRET: ${TWITTER_APP_SECRET:0:10}..." 
echo "   TWITTER_ACCESS_TOKEN: ${TWITTER_ACCESS_TOKEN:0:20}..."
echo "   TWITTER_ACCESS_TOKEN_SECRET: ${TWITTER_ACCESS_TOKEN_SECRET:0:10}..."
echo ""
echo "🧪 现在可以运行测试了:"
echo "   node local-twitter.js \"测试消息\"" 