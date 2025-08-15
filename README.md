# 海盜大叔航海誌 (Chronicle of the Uncle Pirates)

一個公開、透明的團隊網站，用於展示活動相簿和公積金收支明細。

## ✨ 專案特色

- 🏴‍☠️ **海盜主題設計** - 充滿冒險精神的視覺風格
- 📸 **活動相簿展示** - 精美的網格式相簿瀏覽
- 💰 **透明財務管理** - 清晰的收支明細和統計資訊
- 📱 **響應式設計** - 完美支援手機和桌面裝置
- 🔄 **即時資料更新** - 與 Google Sheets 即時同步
- 🚀 **現代化部署** - Vercel 自動部署，支援 SSR

## 🛠 技術架構

- **前端框架**: Next.js 15 (React 19)
- **樣式框架**: Tailwind CSS
- **部署平台**: Vercel (支援 SSR)
- **資料來源**: Google Sheets
- **API 整合**: Google Sheets API
- **自動部署**: Git Push 觸發自動部署

## 🚀 快速部署指南

### 🆕 推薦：Vercel 部署 (SSR + 即時資料)

詳細步驟請參考：[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**快速設定：**

1. **準備 Google Sheets API**：
   - 在 [Google Cloud Console](https://console.cloud.google.com/) 建立專案
   - 啟用 Google Sheets API 並建立服務帳戶
   - 將服務帳戶電子郵件加入試算表共用

2. **部署到 Vercel**：
   - 前往 [Vercel](https://vercel.com/) 匯入 GitHub repository
   - 設定環境變數：`GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
   - 自動部署完成！

3. **自動更新**：
   - 推送代碼到 `master` 分支即自動部署
   - Google Sheets 資料即時同步

### 📋 舊版：GitHub Pages 設定步驟

<details>
<summary>點擊展開 GitHub Pages 部署方法</summary>

### 第一步：準備 Google Sheets

1. 建立一個新的 Google Sheets 試算表
2. 將試算表重新命名為「收支明細」或其他合適的名稱
3. 確保工作表名稱為「相簿」和「收支明細」
4. 設定資料結構（參考 PROJECT_DOCUMENTATION.md）

### 第二步：設定 Google Sheets API

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google Sheets API
4. 建立服務帳戶：
   - 前往「IAM 和管理」> 「服務帳戶」
   - 建立服務帳戶
   - 下載 JSON 憑證檔案
5. 將服務帳戶的電子郵件地址加入 Google Sheets 的共用對象（檢視者權限）

### 第三步：設定 GitHub

1. Fork 或複製此專案到你的 GitHub 帳戶
2. 在 GitHub 儲存庫設定中，啟用 GitHub Pages
3. 設定以下 Secrets（Settings > Secrets and variables > Actions）：
   ```
   GOOGLE_SHEET_ID=你的Google Sheets ID
   GOOGLE_SERVICE_ACCOUNT_EMAIL=服務帳戶電子郵件
   GOOGLE_PRIVATE_KEY=服務帳戶私鑰（完整的 JSON 檔案內容）
   ```

### 第四步：設定 Google Apps Script

1. 前往 [Google Apps Script](https://script.google.com/)
2. 建立新專案
3. 將 `google-apps-script/updateWebsite.gs` 的內容貼入
4. 設定腳本屬性：
   - 前往「專案設定」> 「腳本屬性」
   - 新增以下屬性：
     ```
     GITHUB_TOKEN=你的GitHub Personal Access Token
     GITHUB_OWNER=你的GitHub使用者名稱
     GITHUB_REPO=chronicle_of_the_uncle_pirates
     ```

### 第五步：在 Google Sheets 中建立觸發按鈕

1. 在 Google Sheets 中插入圖片或按鈕
2. 點選圖片/按鈕，選擇「指派指令碼」
3. 輸入函式名稱：`updateWebsite`
4. 儲存並測試

</details>

## 🚀 本地開發

1. 複製專案並安裝依賴：
   ```bash
   git clone https://github.com/your-username/chronicle_of_the_uncle_pirates.git
   cd chronicle_of_the_uncle_pirates
   npm install
   ```

2. 設定環境變數，建立 `.env.local`：
   ```env
   GOOGLE_SHEET_ID=your_sheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
   ```

3. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

4. 建置專案：
   ```bash
   npm run build
   ```

**注意**：Vercel 部署時會自動處理建置和部署流程。

## 📊 資料結構

詳細的資料結構定義請參考 [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)。

### 相簿資料 (Albums)
| 欄位 | 說明 |
|------|------|
| AlbumID | 相簿ID |
| Title | 活動標題 |
| Date | 活動日期 |
| Description | 描述 |
| CoverImageURL | 封面圖片連結 |
| AlbumURL | Google 相簿連結 |

### 交易記錄 (Transactions)
| 欄位 | 說明 |
|------|------|
| TransactionID | 交易ID |
| Date | 交易日期 |
| Description | 項目說明 |
| Type | 收入/支出 |
| Amount | 金額 |
| Handler | 經手人 |
| ReceiptURL | 收據連結（選填） |
| Balance | 結餘 |

## 🔧 自訂設定

### 修改網站標題和內容

編輯以下檔案：
- `src/app/page.tsx` - 首頁內容
- `src/app/layout.tsx` - 網站標題和 meta 資訊

### 修改顏色主題

Tailwind CSS 的主要顏色已設定為：
- 主色調：藍色 (blue)
- 相簿：綠色 (green/emerald)
- 財務：琥珀色 (amber/orange)

### 修改工作表名稱

如果你的 Google Sheets 工作表名稱不同，請修改 `src/lib/sheets.ts` 中的範圍設定。

## 📝 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 🤝 貢獻指南

歡迎提交 Pull Request 或開啟 Issue 來改善這個專案！

## 📞 支援

如果遇到問題，請在 GitHub 上開啟 Issue，或參考專案文件中的疑難排解章節。