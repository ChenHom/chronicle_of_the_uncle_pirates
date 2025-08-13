# 海盜大叔航海誌 (Chronicle of the Uncle Pirates) - 專案說明書

本文件旨在定義「海盜大叔航海誌」專案的開發目標、技術架構、資料結構、設計概念與開發流程，作為後續開發的最高指導原則。

## 1. 專案總覽 (Project Overview)

*   **中文名稱：** 海盜大叔航海誌
*   **英文名稱：** Chronicle of the Uncle Pirates
*   **核心目標：** 建立一個公開、透明的團隊網站，主要用於：
    1.  **展示活動相簿：** 方便團隊成員回顧歷次比賽與活動的照片。
    2.  **公開公積金收支：** 清晰地展示團隊公積金的所有收入、支出與結餘明細。

## 2. 系統架構與技術選型 (Architecture & Technology)

*   **前端框架 (Frontend):** Next.js (React)
*   **樣式方案 (Styling):** Tailwind CSS
*   **資料來源 (Data Source):** Google Sheets
*   **串接方式 (Integration):** Google Sheets API
*   **部署平台 (Deployment):** GitHub Pages
*   **部署觸發器 (Deployment Trigger):** Google Apps Script + GitHub Actions

**註：** 採用 Next.js 的靜態網站生成 (SSG) 模式部署。為解決靜態網站無法即時更新的問題，我們將建立一個由 Google Sheet 按鈕觸發的自動化部署流程。使用者在更新完 Sheet 內容後，點擊按鈕即可觸發 GitHub Actions 重新建置與部署網站。

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

1.  **前置作業 (使用者):**
    *   建立符合資料結構的 Google Sheet。
    *   完成 Google Sheets API 的權限設定 (提供 JSON 憑證)。
    *   產生用於觸發部署的 GitHub Personal Access Token (PAT)。

2.  **系統開發 (開發者):**
    *   建立 Next.js 專案與網站介面。
    *   開發讀取 Google Sheets API 的後端邏輯。
    *   撰寫 GitHub Actions 的自動化部署設定檔 (`deploy.yml`)。
    *   提供 Google Apps Script 程式碼。

3.  **系統整合 (使用者 & 開發者):**
    *   使用者將專案上傳至個人 GitHub。
    *   使用者將 PAT 安全地存入 Google Apps Script 中。
    *   使用者在 Google Sheet 中建立觸發按鈕並指派指令碼。

4.  **內容更新與部署 (使用者):**
    *   在 Google Sheet 中編輯資料。
    *   點擊 Sheet 中的「更新網站」按鈕。
    *   GitHub Actions 自動完成網站的重新建置與部署。

## 6. 下一步 (Next Steps)

專案的啟動取決於以下兩項前置作業的完成：

1.  **建立 Google Sheet 檔案**，並填入測試資料。
2.  **設定 Google Sheets API 權限**，並提供 JSON 憑證給開發者。
