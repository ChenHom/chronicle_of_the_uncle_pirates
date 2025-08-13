#!/bin/bash

# 海盜大叔航海誌部署腳本
# 手動觸發 GitHub Actions 部署

set -e

# 顏色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 顯示標題
echo -e "${BLUE}🚀 海盜大叔航海誌部署工具${NC}"
echo "=================================="

# 檢查 gh CLI 是否安裝
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ 錯誤: GitHub CLI (gh) 未安裝${NC}"
    echo "請安裝 GitHub CLI: https://cli.github.com/"
    exit 1
fi

# 檢查是否登入 GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ 錯誤: 尚未登入 GitHub CLI${NC}"
    echo "請執行: gh auth login"
    exit 1
fi

# 檢查是否在 git repository 中
if ! git rev-parse --git-dir &> /dev/null; then
    echo -e "${RED}❌ 錯誤: 不在 git repository 中${NC}"
    exit 1
fi

# 顯示選單
echo -e "${YELLOW}請選擇操作:${NC}"
echo "1) 🔨 本地建置 + 觸發部署"
echo "2) ⚡ 直接觸發部署"
echo "3) 📊 查看部署狀態"
echo "4) 👀 即時監控部署"
echo "5) 🔍 查看部署歷史"
echo "0) 退出"
echo ""

read -p "請輸入選項 (0-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🔨 執行本地建置...${NC}"
        npm run build
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 本地建置成功${NC}"
            echo -e "${BLUE}🚀 觸發 GitHub Actions 部署...${NC}"
            gh workflow run deploy.yml --ref master
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ 部署已成功觸發！${NC}"
                echo -e "${YELLOW}💡 可以執行 'npm run deploy:status' 查看狀態${NC}"
            else
                echo -e "${RED}❌ 觸發部署失敗${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ 本地建置失敗，請檢查錯誤訊息${NC}"
            exit 1
        fi
        ;;
    2)
        echo -e "${BLUE}⚡ 直接觸發部署...${NC}"
        gh workflow run deploy.yml --ref master
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 部署已成功觸發！${NC}"
            echo -e "${YELLOW}💡 GitHub Actions 將會自動執行建置和部署${NC}"
            echo -e "${YELLOW}💡 可以執行 'npm run deploy:status' 查看狀態${NC}"
        else
            echo -e "${RED}❌ 觸發部署失敗${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${BLUE}📊 查看部署狀態...${NC}"
        gh run list --workflow=deploy.yml --limit=5
        ;;
    4)
        echo -e "${BLUE}👀 即時監控部署...${NC}"
        echo -e "${YELLOW}💡 將會顯示最新的部署進度，按 Ctrl+C 退出監控${NC}"
        sleep 2
        gh run watch
        ;;
    5)
        echo -e "${BLUE}🔍 查看部署歷史...${NC}"
        gh run list --workflow=deploy.yml --limit=10
        ;;
    0)
        echo -e "${YELLOW}👋 再見！${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 無效的選項，請輸入 0-5${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 操作完成！${NC}"
echo -e "${YELLOW}💡 提示: 你也可以直接使用 npm scripts:${NC}"
echo "  - npm run deploy        (本地建置 + 觸發部署)"
echo "  - npm run deploy:manual (直接觸發部署)"
echo "  - npm run deploy:status (查看狀態)"
echo "  - npm run deploy:watch  (即時監控)"