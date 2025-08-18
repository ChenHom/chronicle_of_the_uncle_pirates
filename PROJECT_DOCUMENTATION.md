# 海盜大叔航海誌 (Chronicle of the Uncle Pirates) - 專案說明書

本文件旨在定義「海盜大叔航海誌」專案的開發目標、技術架構、資料結構、設計概念與開發流程，作為後續開發的最高指導原則。

## 1. 專案總覽 (Project Overview)

*   **中文名稱：** 海盜大叔航海誌
*   **英文名稱：** Chronicle of the Uncle Pirates
*   **核心目標：** 建立一個公開、透明的團隊網站，主要用於：
    1.  **展示活動相簿：** 方便團隊成員回顧歷次比賽與活動的照片。
    2.  **公開公積金收支：** 清晰地展示團隊公積金的所有收入、支出與結餘明細。

## 2. 系統架構與技術選型 (Architecture & Technology)

*   **前端框架 (Frontend):** Next.js 15 (React 19) + TypeScript
*   **樣式方案 (Styling):** Tailwind CSS v4
*   **資料來源 (Data Source):** Google Sheets
*   **串接方式 (Integration):** Google Sheets API (已優化認證)
*   **部署平台 (Deployment):** Vercel (支援 SSR)
*   **快取策略 (Caching):** 雙層快取架構
*   **部署觸發器 (Deployment Trigger):** Git Push 自動部署

### 2.1 快取架構詳細說明

**採用雙層快取策略以優化效能：**

1. **應用程式內存快取 (In-Memory Cache)**
   - 快取時間：5 分鐘
   - 適用範圍：Google Sheets API 回應資料
   - 優點：極快的存取速度，減少 API 呼叫

2. **Next.js ISR 快取 (Incremental Static Regeneration)**
   - 首頁/財務頁面：5 分鐘
   - 相簿頁面：10 分鐘
   - 優點：靜態頁面效能，支援即時更新

**註：** 已從 GitHub Pages 靜態部署遷移到 Vercel SSR 部署。新架構支援伺服器端渲染，提供更好的效能和 SEO 優化，同時透過快取策略大幅減少 Google Sheets API 呼叫頻率。

## 3. 資料庫結構 (Data Structure)

資料將儲存於一個 Google Sheet 檔案中，包含以下兩個工作表。

### 3.1. 工作表：`相簿 (Albums)`

| 欄位名稱 (英文) | 欄位名稱 (中文) | 說明 | 範例 |
| :--- | :--- | :--- | :--- |
| `AlbumID` | 相簿ID | 獨一無二的編號。 | `A001` |
| `Title` | 活動標題 | 相簿的名稱。 | `2025 夏季聯賽` |
| `Date` | 活動日期 | 活動舉辦的日期。 | `2025-07-26` |
| `Description` | 描述 | 對這個活動的簡單介紹。 | `今年夏天最熱血的一場比賽！` |
| `CoverImageURL` | 封面圖片連結 | 作為相簿的封面圖。 | `https://i.imgur.com/your-image.jpg` |
| `AlbumURL` | 相簿連結 | Google 相簿的共享連結。 | `https://photos.app.goo.gl/your-album-link` |

### 3.2. 工作表：`收支明細 (Transactions)`

| 欄位名稱 (英文) | 欄位名稱 (中文) | 說明 | 範例 |
| :--- | :--- | :--- | :--- |
| `TransactionID` | 交易ID | 獨一無二的編號。 | `T001` |
| `Date` | 交易日期 | 收入或支出的日期。 | `2025-08-01` |
| `Description` | 項目說明 | 這筆錢的用途或來源。 | `購買新球` |
| `Type` | 類型 | 「收入」或「支出」。 | `支出` |
| `Amount` | 金額 | 交易的金額。 | `1500` |
| `Handler` | 經手人 | 處理這筆款項的成員。 | `陳大文` |
| `ReceiptURL` | 收據/證明連結 | (選填) 收據照片連結。 | `https://i.imgur.com/your-receipt.jpg` |
| `Balance` | 結餘 | **(自動計算)** 當下最新的總金額。 | `3500` |

**註：** `Balance` 欄位應使用 Google Sheet 公式自動計算，以確保資料一致性。

## 4. 介面設計 (UI/UX Design)

*   **整體風格：** 簡潔、現代，採用淺色系搭配主題色，並優先考慮行動裝置的瀏覽體驗 (RWD)。
*   **首頁：** 包含主視覺、歡迎標語，以及導向「活動相簿」和「公積金總覽」的快速入口卡片。
*   **活動相簿頁：** 以網格卡片形式陳列所有相簿，每張卡片顯示封面、標題與日期。點擊後在新分頁開啟 Google 相簿連結。
*   **公積金明細頁：**
    *   **頂部：** 數據總覽區，醒目地顯示「總收入」、「總支出」與「目前結餘」。
    *   **下方：** 乾淨的交易明細表格，並以顏色區分收支類型，提升可讀性。

## 5. 開發與部署流程 (Development & Deployment Workflow)

### 5.1 現代化 Vercel 部署流程 (當前使用)

1.  **前置作業 (使用者):**
    *   建立符合資料結構的 Google Sheet
    *   完成 Google Sheets API 的權限設定 (提供 JSON 憑證)
    *   在 Vercel 設定環境變數

2.  **自動化部署 (已設定完成):**
    *   推送代碼到 `master` 分支觸發 Production 部署
    *   建立 Pull Request 觸發 Preview 部署
    *   支援即時 Google Sheets 資料同步
    *   雙層快取策略自動優化效能

3.  **內容更新流程 (簡化版):**
    *   在 Google Sheet 中編輯資料
    *   資料透過快取機制自動更新 (5-10分鐘內)
    *   無需手動觸發部署

### 5.2 傳統 GitHub Pages 流程 (備用選項)

<details>
<summary>展開舊版流程說明</summary>

1.  **前置作業 (使用者):**
    *   建立符合資料結構的 Google Sheet
    *   完成 Google Sheets API 的權限設定
    *   產生 GitHub Personal Access Token (PAT)

2.  **系統開發 (開發者):**
    *   建立 Next.js 專案與網站介面
    *   開發讀取 Google Sheets API 的後端邏輯
    *   撰寫 GitHub Actions 的自動化部署設定檔
    *   提供 Google Apps Script 程式碼

3.  **系統整合:**
    *   使用者將專案上傳至個人 GitHub
    *   設定 GitHub Secrets 和 Actions
    *   在 Google Sheet 中建立觸發按鈕

4.  **內容更新與部署:**
    *   在 Google Sheet 中編輯資料
    *   點擊 Sheet 中的「更新網站」按鈕
    *   GitHub Actions 自動完成重新建置與部署

</details>

## 6. 專案現況與後續發展 (Current Status & Future Development)

### 6.1 已完成項目 ✅

1.  **核心功能開發**：網站基本功能已完成
2.  **Vercel 部署遷移**：已成功從 GitHub Pages 遷移
3.  **Google Sheets API 整合**：認證問題已解決，API 連接正常
4.  **快取策略實作**：雙層快取機制已實作並運行
5.  **效能優化**：大幅提升載入速度和使用者體驗

### 6.2 技術債務處理 ✅

1.  **JWT 認證修正**：修正 Google API 認證方式
2.  **Next.js 配置優化**：移除不必要的靜態匯出設定
3.  **快取機制**：實作內存快取和 ISR 快取策略
4.  **文件更新**：更新部署指南和技術文件

### 6.3 後續發展方向

1.  **功能增強**：
    *   增加資料篩選和搜尋功能
    *   實作更豐富的統計圖表
    *   增加移動端操作體驗

2.  **效能持續優化**：
    *   監控 API 使用量和快取命中率
    *   根據使用模式調整快取策略
    *   實作 CDN 和圖片最佳化

3.  **維護與監控**：
    *   設定錯誤監控和告警
    *   定期檢查 Google Sheets API 配額
    *   維護環境變數和憑證安全性
