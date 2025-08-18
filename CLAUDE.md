# 海盜大叔航海誌 - Claude Code 專案配置

## 📋 專案概覽

**專案名稱**: 海盜大叔航海誌 (Chronicle of the Uncle Pirates)  
**專案類型**: 公開透明的團隊網站  
**核心功能**: 展示活動相簿 + 公積金收支明細  
**技術架構**: Next.js 15 + React 19 + TypeScript + Vercel SSR  
**當前狀態**: ✅ 生產就緒，穩定運行

## 🚀 快速開始

### 常用開發指令
```bash
npm run dev      # 本地開發伺服器
npm run build    # 建置專案
npm run start    # 啟動生產版本
npm run lint     # 程式碼檢查
```

### 環境設定
建立 `.env.local` 檔案：
```env
GOOGLE_SHEET_ID=1dpXWrl9YzgodL9L8-oIoMQImg4PcsIn-9DzwLv6S3RY
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-reader@little-pirates.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[私鑰內容]\n-----END PRIVATE KEY-----"
```

## 🏗 專案架構

### 核心檔案結構
```
src/
├── app/
│   ├── page.tsx           # 首頁
│   ├── albums/page.tsx    # 相簿頁面
│   ├── finances/page.tsx  # 財務頁面
│   └── api/cache-status/  # 快取管理 API
├── components/
│   ├── CacheIndicator.tsx # 快取狀態指示器
│   └── LoadingSpinner.tsx # 載入動畫
└── lib/
    └── sheets.ts          # Google Sheets API 核心邏輯 ⭐
```

### 重要檔案說明
- **`src/lib/sheets.ts`**: Google Sheets API 整合的核心檔案，包含雙層快取策略
- **環境變數**: 所有敏感資訊都透過環境變數管理，絕不在程式碼中硬編碼

## ⚡ 效能優化 - 雙層快取策略

### 快取層級
1. **內存快取**: 5分鐘，減少 API 呼叫
2. **ISR 快取**: 首頁/財務 5分鐘，相簿 10分鐘

### 效能指標
- **冷啟動**: 1-3秒
- **熱快取**: <100ms ⚡
- **溫快取**: <500ms

## 🔗 Google Sheets 整合

### 資料結構
- **相簿工作表**: AlbumID, Title, Date, Description, CoverImageURL, AlbumURL
- **收支明細工作表**: TransactionID, Date, Description, Type, Amount, Handler, ReceiptURL, Balance

### ⚠️ 重要注意事項
1. **JWT 認證**: 使用物件參數方式，已修正舊版位置參數問題
2. **API 配額**: 透過快取策略大幅減少 API 呼叫頻率
3. **權限設定**: 服務帳戶需要 Google Sheets 的檢視者權限

## 🚀 部署資訊

### Vercel 自動部署
- **Production**: 推送到 `master` 分支自動觸發
- **Preview**: 建立 PR 自動建立預覽部署
- **環境變數**: 在 Vercel Dashboard 設定，支援 Production/Preview 環境

### 部署檢查清單
✅ 環境變數設定正確  
✅ Google Sheets API 權限正常  
✅ 快取策略運行穩定  
✅ 自動部署流程正常  

## 🛠 開發指南

### 修改資料來源
如需更改 Google Sheets，請更新：
1. `GOOGLE_SHEET_ID` 環境變數
2. 確保新試算表有正確的工作表名稱（「相簿」和「收支明細」）
3. 將服務帳戶加入新試算表的共用對象

### 效能除錯
- 開發環境會顯示快取狀態指示器（右下角）
- 可透過 `/api/cache-status` 查看快取狀態
- 快取問題可透過重啟開發伺服器解決

### 常見問題
1. **API 認證失敗**: 檢查環境變數和 Google Sheets 權限
2. **資料不更新**: 檢查快取狀態，等待快取過期或重啟
3. **建置失敗**: 確認 TypeScript 型別正確

## 📚 重要文件參考

### 原有專案文件
- **[README.md](./README.md)**: 完整的專案說明和部署指南
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**: Vercel 部署詳細步驟
- **[CACHE_STRATEGY.md](./CACHE_STRATEGY.md)**: 快取策略詳細說明
- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**: 技術架構和資料結構

### 收費管理系統文件
- **[PAYMENT_SYSTEM_DESIGN.md](./PAYMENT_SYSTEM_DESIGN.md)**: 收費系統架構設計
- **[PAYMENT_SYSTEM_STATUS.md](./PAYMENT_SYSTEM_STATUS.md)**: 系統實作狀態報告
- **[.env.local.example](./.env.local.example)**: 環境變數設定範例

## 🔄 專案歷史重點

### 已完成的重大改進 ✅
- **Vercel 遷移**: 從 GitHub Pages 成功遷移到 Vercel SSR
- **API 問題解決**: 修正 Google Sheets JWT 認證問題
- **效能優化**: 實作雙層快取策略，大幅提升效能
- **自動部署**: 建立完整的 CI/CD 流程
- **收費管理系統**: 完整的 LINE Login + 收費管理功能 (2025-08-18 新增)

### 最新功能 🆕 (2025-08-18)
- **LINE Login 認證**: NextAuth.js 整合，支援三級權限控制
- **管理員介面**: 活動建立、成員管理、系統統計
- **收費操作**: 即時收費狀態更新、批次操作支援
- **個人中心**: 個人繳費記錄查看、統計資料
- **API 系統**: 完整的 RESTful API + 權限檢查

### 技術債務狀態
✅ 所有已知技術債務已清理完畢  
✅ 程式碼品質良好  
✅ 文件更新完整  
✅ 收費管理系統整合完成  

## 💡 最佳實踐

1. **程式碼修改**: 優先使用現有的元件和樣式模式
2. **API 呼叫**: 透過 `src/lib/sheets.ts` 進行，利用快取機制
3. **環境管理**: 本地用 `.env.local`，生產用 Vercel 環境變數
4. **測試**: 推送前請確保 `npm run build` 成功
5. **文件**: 重大變更後記得更新相關文件

---

**最後更新**: 2025年8月18日  
**專案狀態**: 穩定運行，功能完整，收費管理系統已整合  
**維護狀態**: 持續監控，按需優化  
**新功能**: LINE Login 認證 + 完整收費管理功能