# Google Apps Script 自動部署設定指南

## 概述

這個設定讓您可以直接在 Google Sheets 中點擊按鈕來觸發網站的重新建置和部署。

## 先決條件

1. 已設定 Google Sheets API 憑證
2. 已有 GitHub Repository 並啟用 GitHub Pages
3. 已設定 GitHub Actions Secrets

## 設定步驟

### 第一步：建立 GitHub Personal Access Token

1. 前往 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 點擊 "Generate new token (classic)"
3. 權限設定：
   - `repo` (完整的 repository 存取權)
   - `workflow` (允許觸發 GitHub Actions)
4. 複製產生的 token，格式類似：`ghp_xxxxxxxxxxxxxxxxxxxx`

### 第二步：設定 Google Apps Script

1. 開啟您的 Google Sheets
2. 前往 Extensions → Apps Script
3. 刪除預設的 `Code.gs` 內容
4. 將 `updateWebsite.gs` 的內容完整貼入
5. 儲存專案 (Ctrl+S)

### 第三步：設定腳本屬性

在 Apps Script 編輯器中：

1. 點擊左側的 "Project Settings" (齒輪圖示)
2. 在 "Script Properties" 區段，點擊 "Add script property"
3. 依序新增以下三個屬性：

```
屬性名稱: GITHUB_TOKEN
值: ghp_your_personal_access_token_here

屬性名稱: GITHUB_OWNER  
值: your_github_username

屬性名稱: GITHUB_REPO
值: chronicle_of_the_uncle_pirates
```

### 第四步：測試連接

1. 在 Apps Script 編輯器中，選擇函式 `testGitHubConnection`
2. 點擊 "Run" (▶️ 按鈕)
3. 授權腳本的權限
4. 查看執行日誌，應該會看到 "✅ GitHub 連接測試成功"

### 第五步：在 Google Sheets 中新增按鈕

1. 回到您的 Google Sheets
2. 選擇一個空白的儲存格 (建議在 A1 或其他顯眼位置)
3. 前往 Insert → Drawing
4. 建立一個按鈕樣式的圖形，例如：
   - 新增矩形
   - 填入顏色 (建議使用品牌色)
   - 加入文字："🚀 更新網站"
5. 點擊 "Save and Close"
6. 選中剛插入的圖形，點擊右上角的三個點 (⋮)
7. 選擇 "Assign script"
8. 輸入函式名稱：`updateWebsite`
9. 點擊 "OK"

### 第六步：測試部署

1. 點擊剛建立的按鈕
2. 應該會看到通知："正在觸發網站更新..."
3. 稍後會顯示："網站更新已成功觸發！請等待 3-5 分鐘讓 GitHub Actions 完成部署。"
4. 前往 GitHub Repository → Actions 查看建置狀態

## 使用方式

### 正常更新流程

1. 在 Google Sheets 中更新資料 (收支明細或相簿資訊)
2. 點擊 "🚀 更新網站" 按鈕
3. 等待 3-5 分鐘，網站會自動更新

### 故障排除

#### 如果按鈕點擊沒有反應
1. 檢查腳本屬性是否正確設定
2. 執行 `testGitHubConnection()` 測試

#### 如果顯示 GitHub API 錯誤
1. 確認 Personal Access Token 是否正確且未過期
2. 確認 token 有正確的權限 (repo + workflow)
3. 確認 GITHUB_OWNER 和 GITHUB_REPO 名稱正確

#### 如果 GitHub Actions 執行失敗
1. 檢查 GitHub Repository 的 Secrets 是否正確設定：
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`  
   - `GOOGLE_PRIVATE_KEY`
2. 查看 Actions 日誌了解具體錯誤

## 安全注意事項

1. **不要** 將 GitHub Personal Access Token 直接寫在腳本中
2. 定期更新 Personal Access Token (建議設定過期時間)
3. 只授予必要的最小權限
4. 如果懷疑 token 洩露，立即撤銷並建立新的

## 高級設定

### 自動更新頻率限制

如果需要限制自動更新頻率，可以在腳本中加入時間檢查邏輯。

### 多環境部署

如果有開發/測試環境，可以複製腳本並設定不同的 repository 屬性。

### 部署通知

可以整合 Slack 或其他通訊工具來接收部署完成通知。

## 支援

如果遇到問題，請檢查：
1. Apps Script 的執行日誌
2. GitHub Actions 的執行記錄
3. 確認所有憑證和權限設定正確