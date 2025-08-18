# Vercel 部署指南

此專案已從 GitHub Pages 遷移到 Vercel，以支援 Server-Side Rendering (SSR) 和 Google Sheets API 整合。

## 🚀 自動部署設定

### 部署觸發條件
- **Production 部署**：推送到 `master` 分支時自動觸發
- **Preview 部署**：建立 Pull Request 時自動觸發

### Git 工作流程
```bash
# 正常開發流程 - 會自動部署到 Production
git add .
git commit -m "更新功能"
git push origin master

# 功能開發流程 - 會建立 Preview 部署
git checkout -b feature/new-feature
# 進行開發...
git push origin feature/new-feature
# 建立 PR 後會自動建立 Preview 部署
```

## ⚙️ Vercel 專案設定

### 1. 匯入專案
1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "New Project"
3. 選擇 GitHub repository: `chronicle_of_the_uncle_pirates`
4. Framework 會自動識別為 Next.js

### 2. 環境變數設定
在 Vercel Dashboard → Settings → Environment Variables 中添加：

```
GOOGLE_SHEET_ID=1dpXWrl9YzgodL9L8-oIoMQImg4PcsIn-9DzwLv6S3RY
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-reader@little-pirates.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n[私鑰內容]\n-----END PRIVATE KEY-----\n
```

**重要**：
- 將變數設定為 **Production** 和 **Preview** 環境
- `GOOGLE_PRIVATE_KEY` 需要包含正確的換行符號 (`\n`)

### 3. 部署設定
- **Build Command**: `npm run build` (預設)
- **Output Directory**: `.next` (預設)
- **Install Command**: `npm ci` (預設)
- **Root Directory**: `.` (根目錄)

## 🔧 專案配置變更

### 移除的 GitHub Pages 設定
- ❌ `output: 'export'` - 不再需要靜態匯出
- ❌ `basePath` - Vercel 自動處理路由
- ❌ GitHub Actions workflows

### 保留的設定
- ✅ `images: { unoptimized: true }` - 保持圖片相容性
- ✅ `trailingSlash: true` - URL 一致性
- ✅ `distDir: '.next'` - 標準建置目錄

## 🚨 注意事項

1. **環境變數安全性**：Vercel 的環境變數只在伺服器端可用，不會暴露給客戶端

2. **自動部署**：每次推送到 master 分支都會觸發部署，請確保代碼已充分測試

3. **Preview 部署**：PR 會建立預覽部署，方便測試新功能

4. **域名**：可在 Vercel → Settings → Domains 設定自訂域名

## 📊 部署監控

### 檢查部署狀態
- Vercel Dashboard 顯示即時部署狀態
- GitHub PR 會自動顯示部署預覽連結
- 部署失敗會發送通知

### 常用指令
```bash
# 檢查專案狀態
npm run build  # 本地建置測試
npm run dev     # 本地開發

# Git 工作流程
git status                    # 檢查檔案狀態
git push origin master       # 推送到 Production
```

## 🔄 從 GitHub Pages 遷移完成清單

- [x] 調整 Next.js 配置移除靜態匯出
- [x] 更新 package.json 移除 GitHub Pages 部署腳本
- [x] 建立 Vercel 部署文件
- [x] 在 Vercel 建立專案並設定環境變數
- [x] 測試首次自動部署
- [x] 實作雙層快取策略
- [x] 修正 Google Sheets API 認證問題
- [x] 停用 GitHub Pages 和 Actions
- [x] 更新 README.md 部署說明
- [x] 更新專案技術文件

## ✅ 遷移完成狀態

**🎉 專案已成功完成從 GitHub Pages 到 Vercel 的遷移！**

### 已實現的改進：
- ⚡ **效能提升**：透過 SSR 和雙層快取策略大幅提升載入速度
- 🔄 **自動部署**：推送代碼即自動部署，無需手動觸發
- 📊 **即時資料**：Google Sheets 資料透過快取機制即時同步
- 🛡️ **安全性**：環境變數安全存儲，不暴露敏感資訊
- 🔧 **開發體驗**：支援 Preview 部署，便於功能測試

### 技術債務解決：
- ✅ JWT 認證方式已修正
- ✅ Next.js 配置已優化
- ✅ 快取策略已實作
- ✅ 所有文件已更新

## 📞 支援

如遇到部署問題：
1. 檢查 Vercel Dashboard 的部署日誌
2. 確認環境變數設定正確
3. 驗證 Google Sheets API 憑證有效

---

**部署網址**：https://[project-name].vercel.app