#!/bin/bash

# 快速部署腳本 - 一鍵觸發部署

set -e

# 顏色設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 快速部署海盜大叔航海誌...${NC}"

# 檢查並觸發部署
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    gh workflow run deploy.yml --ref master
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 部署已觸發！請等待 3-5 分鐘完成部署${NC}"
        echo -e "💡 查看進度: npm run deploy:status"
    else
        echo -e "${RED}❌ 部署觸發失敗${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ GitHub CLI 未安裝或未登入${NC}"
    echo "請先執行: gh auth login"
    exit 1
fi