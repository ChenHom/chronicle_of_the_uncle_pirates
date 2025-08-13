# GitHub Pages 設定檢查清單

## 必要設定步驟

### 1. Repository Settings
前往 GitHub Repository → Settings → Pages：

- **Source**: 選擇 "GitHub Actions"
- **Branch**: 不需要選擇 (GitHub Actions 會自動處理)
- **Custom domain**: (選填) 如果有自訂域名才填入

### 2. Repository 權限
確保 Repository 是：
- ✅ **Public** (GitHub Pages 免費版需要公開 repo)
- 或 ✅ **Private** + GitHub Pro/Team/Enterprise (付費版才支援私有 repo)

### 3. Actions 權限
前往 Settings → Actions → General：
- ✅ **Actions permissions**: "Allow all actions and reusable workflows"
- ✅ **Workflow permissions**: "Read and write permissions"
- ✅ **Allow GitHub Actions to create and approve pull requests**: 勾選

### 4. Pages 權限
前往 Settings → Pages：
- ✅ **Source**: "GitHub Actions"
- ✅ **Enforce HTTPS**: 建議勾選

## 常見問題解決

### 問題 1: Repository 是私有的
**解決方案**: 
- 將 Repository 設為 Public
- 或升級到 GitHub Pro/Team

### 問題 2: Actions 權限不足
**解決方案**:
```bash
# 使用 GitHub CLI 檢查權限
gh api repos/OWNER/REPO --jq '.permissions'
```

### 問題 3: 第一次部署失敗
**解決方案**:
- 第一次需要手動觸發一次
- 可能需要等待 GitHub 建立 Pages 環境

## 手動檢查步驟

### 1. 檢查 Repository 狀態
```bash
# 檢查 repo 基本資訊
gh repo view --json name,visibility,hasPages

# 檢查 Pages 設定
gh api repos/OWNER/REPO/pages
```

### 2. 檢查 Secrets 設定
前往 Settings → Secrets and variables → Actions，確認：
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

### 3. 測試部署
```bash
# 手動觸發部署
gh workflow run deploy.yml

# 查看執行狀態
gh run list --workflow=deploy.yml --limit=1

# 查看詳細日誌
gh run view --log
```

## 完成後確認

部署成功後：
1. 前往 Repository → Actions 查看綠色勾勾
2. 前往 Repository → Settings → Pages 看到網站 URL
3. 點擊 URL 確認網站正常顯示

## 故障排除命令

```bash
# 1. 檢查 repo 是否啟用 Pages
gh api repos/OWNER/REPO/pages

# 2. 檢查最新的 workflow 執行
gh run view

# 3. 重新觸發部署
gh workflow run deploy.yml --ref master

# 4. 即時監控部署
gh run watch
```

## 範例設定截圖位置

在 GitHub Repository 中：
1. Settings → Pages → Source 選擇 "GitHub Actions"
2. Settings → Actions → General → Workflow permissions 選擇 "Read and write permissions"

完成這些設定後，GitHub Actions 應該就能正常部署到 Pages 了。