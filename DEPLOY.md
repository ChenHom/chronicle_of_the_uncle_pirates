# 部署指南

## 快速部署

### 方法一：使用 npm scripts (推薦)

```bash
# 本地建置 + 觸發部署
npm run deploy

# 直接觸發部署 (推薦)
npm run deploy:manual

# 查看部署狀態
npm run deploy:status

# 即時監控部署過程
npm run deploy:watch
```

### 方法二：使用部署腳本

```bash
# 互動式部署工具
./scripts/deploy.sh

# 一鍵快速部署
./scripts/quick-deploy.sh
```

### 方法三：直接使用 GitHub CLI

```bash
# 觸發部署
gh workflow run deploy.yml --ref master

# 查看狀態
gh run list --workflow=deploy.yml --limit=5

# 監控進度
gh run watch
```

## 前置需求

1. **安裝 GitHub CLI**:
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   
   # 或下載: https://cli.github.com/
   ```

2. **登入 GitHub**:
   ```bash
   gh auth login
   ```

3. **確保有正確權限**:
   - Repository 的 write 權限
   - GitHub Actions 啟用

## 部署流程

1. **觸發部署** → GitHub Actions 開始執行
2. **建置網站** → Next.js 靜態匯出
3. **部署到 GitHub Pages** → 網站上線
4. **完成** → 約 3-5 分鐘

## 故障排除

### GitHub CLI 相關

```bash
# 檢查是否安裝
gh --version

# 檢查登入狀態
gh auth status

# 重新登入
gh auth login
```

### 部署失敗

1. **查看錯誤日誌**:
   ```bash
   gh run view --log
   ```

2. **常見問題**:
   - GitHub Secrets 未設定
   - 權限不足
   - 建置錯誤

3. **檢查 Secrets**:
   前往 GitHub Repository → Settings → Secrets and variables → Actions
   確認以下設定存在：
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

### 本地建置測試

```bash
# 本地建置測試
npm run build

# 如果成功，代表程式碼沒問題
# 如果失敗，先修復錯誤再部署
```

## 自動化

### 推送自動部署

每次推送到 `master` 分支會自動觸發部署：

```bash
git add .
git commit -m "update content"
git push origin master
# 自動觸發部署
```

### 定時部署 (可選)

可以在 `.github/workflows/deploy.yml` 中加入定時觸發：

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 每天午夜觸發
```

## 監控

### 部署狀態

```bash
# 查看最近 5 次部署
npm run deploy:status

# 查看詳細記錄
gh run list --workflow=deploy.yml --limit=10
```

### 網站狀態

部署完成後，網站會在以下位置：
- GitHub Pages URL: `https://YOUR_USERNAME.github.io/chronicle_of_the_uncle_pirates`
- 或自訂域名 (如果有設定)

## 安全注意事項

1. **不要提交敏感資料**: 確保 `.env` 檔案在 `.gitignore` 中
2. **GitHub Secrets**: 敏感設定放在 GitHub Secrets，不要寫在程式碼中
3. **權限管理**: 只給必要的最小權限

## 進階設定

### 自訂域名

1. 在 repository 的 Settings → Pages 中設定
2. 建立 `public/CNAME` 檔案，內容為您的域名

### 部署環境

- **生產環境**: `master` 分支
- **測試環境**: 可建立 `develop` 分支並設定別的 workflow

### 通知設定

可以整合 Slack 或 Discord 來接收部署完成通知。