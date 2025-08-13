# 權限錯誤解決方案

## 錯誤訊息
```
Exception: You do not have permission to call SpreadsheetApp.getActiveSpreadsheet. Required
```

## 原因
Google Apps Script 需要明確授權才能存取 Google Sheets 和外部 API。

## 解決步驟

### **方法一：重新授權 (推薦)**

1. **在 Apps Script 編輯器中**：
   - 選擇函式 `authorizeScript`
   - 點擊 **執行** (▶️) 按鈕
   - 會彈出權限請求對話框

2. **授權流程**：
   - 點擊 **審查權限**
   - 選擇您的 Google 帳號
   - 會顯示需要的權限：
     - 查看和管理您的試算表
     - 連接到外部服務
   - 點擊 **允許**

3. **確認授權成功**：
   - 查看執行日誌，應該會顯示所有 ✅ 
   - Google Sheets 會顯示成功通知

4. **測試功能**：
   - 現在可以執行 `updateWebsite()` 函式
   - 應該不會再出現權限錯誤

### **方法二：手動設定權限範疇**

如果方法一不行，可以手動設定：

1. **在 Apps Script 編輯器中**：
   - 點擊左側 **專案設定** (齒輪圖示)
   - 勾選 **顯示 "appsscript.json" 資訊清單檔案**

2. **編輯 appsscript.json**：
```json
{
  "timeZone": "Asia/Taipei",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

3. **儲存並重新授權**：
   - 儲存檔案
   - 再次執行 `authorizeScript()` 函式
   - 重新進行授權流程

### **方法三：從頭建立新專案**

如果以上方法都失效：

1. **建立新的 Apps Script 專案**：
   - 前往 [script.google.com](https://script.google.com)
   - 點擊 **新專案**

2. **綁定到 Google Sheets**：
   - 在新專案中，點擊 **資源** → **雲端硬碟 SDK**
   - 或者直接從 Google Sheets：**擴充功能** → **Apps Script**

3. **貼入程式碼**：
   - 將完整的 `updateWebsite.gs` 程式碼貼入
   - 按照正常流程設定

### **方法四：檢查帳號權限**

1. **確認帳號狀態**：
   - 確保您是 Google Sheets 的擁有者或編輯者
   - 不能是僅檢視權限

2. **檢查企業政策**：
   - 如果是企業帳號，可能有政策限制
   - 聯繫 IT 管理員確認 Apps Script 權限

## 常見問題

### Q: 授權後還是出現權限錯誤？
A: 嘗試清除瀏覽器快取，或使用無痕模式重新授權

### Q: 授權對話框沒有出現？
A: 檢查瀏覽器是否阻擋彈出視窗，暫時關閉廣告阻擋器

### Q: 顯示「此應用程式未經驗證」？
A: 這是正常的，點擊 **進階** → **前往專案 (不安全)**

### Q: 企業帳號無法授權？
A: 聯繫 IT 管理員，可能需要管理員批准或調整 Google Workspace 設定

## 測試清單

執行 `authorizeScript()` 後，應該看到：
- ✅ 試算表權限正常
- ✅ 外部請求權限正常  
- ✅ 屬性服務權限正常
- ✅ 用戶會話權限正常

全部顯示 ✅ 後，就可以正常使用 `updateWebsite()` 功能了。

## 預防措施

1. **定期檢查權限**：權限可能會過期，建議每月執行一次 `quickTest()`
2. **備份腳本設定**：記錄腳本屬性的值，以防需要重新建立
3. **測試環境**：在重要更新前先在測試環境驗證