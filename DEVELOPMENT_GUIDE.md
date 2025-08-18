# 收費管理系統 - 開發指南

## 🎯 開發總覽

本指南提供收費管理系統的完整開發步驟，從環境設定到上線部署的詳細說明。

**開發目標**: 整合 LINE 認證和收費管理功能到現有的海盜大叔航海誌系統  
**預估工期**: 3-4 週  
**技術難度**: 中等  

## 📋 開發前準備

### 開發環境要求
```bash
Node.js: 18.x 或更高版本
npm: 9.x 或更高版本
Git: 2.x 或更高版本
編輯器: VS Code (推薦) + 相關 Extensions
```

### 必要的外部服務帳戶
1. **LINE Developers Console** - LINE Login 整合
2. **Google Cloud Console** - Sheets API 讀寫權限
3. **Vercel Account** - 部署和環境變數管理

### VS Code 推薦 Extensions
```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag
- Prettier - Code formatter
- GitLens
- Thunder Client (API 測試)
```

## 🏗 開發階段規劃

### 第一階段：基礎建設 (週 1)

#### 1.1 LINE Login 設定
**目標**: 完成 LINE 認證整合

**步驟**:
1. **LINE Developers Console 設定**
   ```bash
   # 前往 https://developers.line.biz/
   # 建立新的 Channel (LINE Login)
   
   Channel 設定:
   - Channel name: 海盜大叔航海誌
   - Channel description: 團隊收費管理系統
   - App type: Web app
   - Callback URL: https://your-domain.com/api/auth/callback/line
   ```

2. **安裝必要套件**
   ```bash
   npm install next-auth
   npm install @next-auth/prisma-adapter  # 如果需要
   npm install swr  # 資料獲取
   npm install react-hook-form  # 表單處理
   npm install react-hot-toast  # 通知
   ```

3. **建立認證配置**
   ```bash
   # 建立檔案
   touch pages/api/auth/[...nextauth].ts
   touch lib/auth.ts
   touch types/auth.ts
   
   # 設定環境變數
   echo "LINE_CHANNEL_ID=your_channel_id" >> .env.local
   echo "LINE_CHANNEL_SECRET=your_channel_secret" >> .env.local
   echo "NEXTAUTH_SECRET=your_secret_key" >> .env.local
   echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
   ```

4. **實作認證邏輯**
   ```typescript
   // pages/api/auth/[...nextauth].ts
   // 參考 AUTH_FLOW.md 的完整實作
   ```

#### 1.2 Google Sheets 擴充設定
**目標**: 準備資料庫架構

**步驟**:
1. **升級 Google Service Account 權限**
   ```bash
   # 修改環境變數
   GOOGLE_SHEETS_SCOPE=https://www.googleapis.com/auth/spreadsheets
   ```

2. **建立新的工作表**
   ```bash
   # 在現有 Google Sheets 新增工作表:
   - 可註冊人員列表
   - 已註冊成員
   - 待審核申請
   - 活動管理
   - 收費追蹤
   ```

3. **更新 Google Sheets API 層**
   ```bash
   # 建立新檔案
   touch lib/sheets-database.ts
   touch lib/auth-manager.ts
   touch types/database.ts
   ```

#### 1.3 專案結構調整
**目標**: 建立管理介面架構

**步驟**:
```bash
# 建立管理介面目錄結構
mkdir -p src/app/management/{dashboard,events,members,payments}
mkdir -p src/app/collection
mkdir -p src/app/my
mkdir -p src/app/auth
mkdir -p src/components/management
mkdir -p src/components/payment
mkdir -p src/hooks
mkdir -p src/utils

# 建立基本檔案
touch src/app/management/layout.tsx
touch src/app/management/dashboard/page.tsx
touch src/app/auth/signin/page.tsx
touch src/components/ProtectedRoute.tsx
touch src/hooks/useAuth.ts
```

### 第二階段：核心功能 (週 2-3)

#### 2.1 成員管理功能
**目標**: 完成註冊審核和成員管理

**開發順序**:
1. **成員註冊流程**
   ```bash
   # 開發檔案
   src/app/auth/signin/page.tsx          # 登入頁面
   src/app/auth/pending/page.tsx         # 等待審核頁面
   src/lib/auth-manager.ts               # 認證邏輯
   src/components/auth/LoginButton.tsx   # 登入按鈕
   ```

2. **管理員審核介面**
   ```bash
   # 開發檔案
   src/app/management/members/page.tsx           # 成員列表
   src/app/management/members/pending/page.tsx   # 待審核列表
   src/components/management/MemberCard.tsx      # 成員卡片
   src/components/management/ApprovalModal.tsx   # 審核彈窗
   ```

3. **API 端點實作**
   ```bash
   # 建立 API 檔案
   touch src/app/api/me/route.ts
   touch src/app/api/members/route.ts
   touch src/app/api/members/pending/route.ts
   touch src/app/api/auth/approve-registration/route.ts
   ```

#### 2.2 活動管理功能
**目標**: 完成活動 CRUD 和成員選擇

**開發順序**:
1. **活動列表和詳情**
   ```bash
   # 開發檔案
   src/app/management/events/page.tsx        # 活動列表
   src/app/management/events/create/page.tsx # 建立活動
   src/app/management/events/[id]/page.tsx   # 活動詳情
   src/components/management/EventCard.tsx   # 活動卡片
   src/components/management/EventForm.tsx   # 活動表單
   ```

2. **成員選擇介面**
   ```bash
   # 開發檔案
   src/components/management/MemberSelector.tsx  # 成員選擇器
   src/components/common/SearchInput.tsx         # 搜尋輸入框
   src/hooks/useMembers.ts                       # 成員資料 Hook
   ```

3. **活動 API**
   ```bash
   # 建立 API 檔案
   touch src/app/api/events/route.ts
   touch src/app/api/events/[id]/route.ts
   touch src/app/api/events/[id]/participants/route.ts
   ```

#### 2.3 收費管理功能
**目標**: 完成收費狀態更新和進度追蹤

**開發順序**:
1. **收費操作介面**
   ```bash
   # 開發檔案
   src/app/collection/page.tsx                    # 收費活動列表
   src/app/collection/[eventId]/page.tsx          # 收費操作頁面
   src/components/payment/PaymentList.tsx         # 收費清單
   src/components/payment/PaymentCard.tsx         # 收費卡片 (手機優化)
   src/components/payment/BatchUpdateModal.tsx    # 批量更新
   ```

2. **手機優化設計**
   ```bash
   # 開發檔案
   src/components/payment/MobilePaymentCard.tsx   # 手機收費卡片
   src/components/common/SwipeActions.tsx         # 滑動操作
   src/hooks/useSwipeGesture.ts                   # 滑動手勢
   ```

3. **收費 API**
   ```bash
   # 建立 API 檔案
   touch src/app/api/payments/[eventId]/route.ts
   touch src/app/api/payments/[trackingId]/route.ts
   touch src/app/api/payments/batch-update/route.ts
   ```

### 第三階段：進階功能 (週 4)

#### 3.1 統計和報表
**目標**: 完成收費進度統計和報表

**開發順序**:
1. **統計圖表**
   ```bash
   # 安裝圖表庫
   npm install recharts
   
   # 開發檔案
   src/components/charts/PaymentProgressChart.tsx  # 收費進度圖
   src/components/charts/PaymentMethodChart.tsx    # 付款方式統計
   src/hooks/useChartData.ts                       # 圖表資料
   ```

2. **報表頁面**
   ```bash
   # 開發檔案
   src/app/management/reports/page.tsx             # 報表總覽
   src/app/management/reports/[eventId]/page.tsx   # 活動報表
   src/components/reports/EventSummary.tsx         # 活動統計
   ```

#### 3.2 使用者體驗優化
**目標**: 提升整體使用體驗

**開發重點**:
1. **載入狀態和錯誤處理**
   ```bash
   # 開發檔案
   src/components/common/LoadingSpinner.tsx        # 載入動畫
   src/components/common/ErrorBoundary.tsx         # 錯誤邊界
   src/components/common/ErrorMessage.tsx          # 錯誤訊息
   src/hooks/useErrorHandler.ts                    # 錯誤處理
   ```

2. **通知和反饋**
   ```bash
   # 開發檔案
   src/components/common/Toast.tsx                 # 通知元件
   src/components/common/ConfirmModal.tsx          # 確認彈窗
   src/utils/notification.ts                       # 通知工具
   ```

3. **快取和效能優化**
   ```bash
   # 開發檔案
   src/hooks/useOptimisticUpdate.ts                # 樂觀更新
   src/utils/cache-manager.ts                      # 快取管理
   ```

## 🔧 開發工具和技巧

### 開發環境設定

#### 1. 建立開發分支
```bash
# 建立功能分支
git checkout -b feature/payment-system
git push -u origin feature/payment-system

# 建立子功能分支
git checkout -b feature/line-auth
git checkout -b feature/payment-ui
git checkout -b feature/admin-panel
```

#### 2. 設定開發環境變數
```bash
# .env.local 範例
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=your_line_secret
NEXTAUTH_SECRET=your_super_long_random_string
NEXTAUTH_URL=http://localhost:3000

# Google Sheets (升級權限)
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_SCOPE=https://www.googleapis.com/auth/spreadsheets

# 開發模式設定
NODE_ENV=development
DEBUG=true
```

#### 3. 開發伺服器設定
```bash
# package.json scripts 建議新增
{
  "scripts": {
    "dev": "next dev",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev",
    "dev:turbo": "next dev --turbo",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### 程式碼品質控制

#### 1. TypeScript 配置
```json
// tsconfig.json 擴充
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ]
}
```

#### 2. ESLint 規則
```json
// .eslintrc.json 擴充
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error"
  }
}
```

#### 3. Git Hooks 設定
```bash
# 安裝 husky
npm install --save-dev husky lint-staged

# 設定 pre-commit hook
npx husky add .husky/pre-commit "npm run type-check && npm run lint"
```

### 測試策略

#### 1. 單元測試設定
```bash
# 安裝測試套件
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# 建立測試檔案
mkdir -p __tests__/{components,hooks,utils,api}
touch jest.config.js
touch jest.setup.js
```

#### 2. API 測試
```bash
# 建立 API 測試
touch __tests__/api/auth.test.ts
touch __tests__/api/events.test.ts
touch __tests__/api/payments.test.ts

# 使用 Thunder Client 或 Postman 建立 API 測試集合
```

#### 3. E2E 測試 (可選)
```bash
# 如果需要端到端測試
npm install --save-dev @playwright/test
npx playwright install
```

### 除錯工具

#### 1. 開發工具設定
```typescript
// lib/debug.ts
export const debug = {
  auth: process.env.DEBUG_AUTH === 'true',
  api: process.env.DEBUG_API === 'true',
  sheets: process.env.DEBUG_SHEETS === 'true',
}

export function debugLog(category: keyof typeof debug, ...args: any[]) {
  if (debug[category]) {
    console.log(`[${category.toUpperCase()}]`, ...args)
  }
}
```

#### 2. API 回應除錯
```typescript
// utils/api-debug.ts
export function logApiCall(url: string, method: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔌 API Call: ${method} ${url}`)
    if (data) console.log('Data:', data)
    console.groupEnd()
  }
}
```

## 📱 手機優化開發指南

### 響應式設計原則

#### 1. Tailwind 斷點策略
```css
/* 手機優先設計 */
.payment-card {
  @apply p-4 mb-3;           /* 手機 */
  @apply md:p-6 md:mb-4;     /* 平板 */
  @apply lg:p-8 lg:mb-6;     /* 桌面 */
}

/* 觸控友善的按鈕 */
.touch-button {
  @apply h-12 min-h-[48px] px-6 text-lg;
  @apply active:scale-95 transition-transform;
}
```

#### 2. 觸控手勢支援
```typescript
// hooks/useSwipeGesture.ts
export function useSwipeGesture(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const [startX, setStartX] = useState(0)
  
  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX)
  }
  
  const handleTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const diff = startX - endX
    
    if (Math.abs(diff) > 50) { // 最小滑動距離
      if (diff > 0 && onSwipeLeft) onSwipeLeft()
      if (diff < 0 && onSwipeRight) onSwipeRight()
    }
  }
  
  return { handleTouchStart, handleTouchEnd }
}
```

#### 3. 視窗大小適應
```typescript
// hooks/useViewport.ts
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false
  })
  
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768
      })
    }
    
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])
  
  return viewport
}
```

## 🚀 部署準備

### 環境變數設定

#### 1. Vercel 環境變數
```bash
# 在 Vercel Dashboard 設定
Production 環境:
LINE_CHANNEL_ID=your_production_channel_id
LINE_CHANNEL_SECRET=your_production_secret
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com

Preview 環境:
LINE_CHANNEL_ID=your_development_channel_id
LINE_CHANNEL_SECRET=your_development_secret
NEXTAUTH_SECRET=your_development_secret
NEXTAUTH_URL=https://your-preview-domain.vercel.app
```

#### 2. Google Sheets 權限升級
```bash
# 確認服務帳戶權限
1. 前往 Google Cloud Console
2. 找到現有的服務帳戶
3. 編輯權限範圍：
   - 從: https://www.googleapis.com/auth/spreadsheets.readonly
   - 改為: https://www.googleapis.com/auth/spreadsheets
4. 重新產生金鑰 (如果需要)
```

### 建置優化

#### 1. Next.js 配置調整
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['recharts', 'react-hook-form']
  },
  images: {
    domains: ['profile.line-scdn.net'], // LINE 頭像
    unoptimized: true
  },
  // 保持現有設定
  trailingSlash: true,
}
```

#### 2. 效能監控設定
```typescript
// lib/monitoring.ts
export function trackPerformance(metricName: string, value: number) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${metricName}:${value}`)
  }
}

// 在關鍵路徑使用
trackPerformance('payment-update', Date.now())
```

## 🧪 測試指南

### 功能測試清單

#### 1. 認證流程測試
```
□ LINE 登入正常運作
□ 新使用者自動配對
□ 多重配對選擇功能
□ 待審核申請建立
□ 管理員審核功能
□ 權限檢查正確
□ 登出功能正常
```

#### 2. 活動管理測試
```
□ 建立活動成功
□ 編輯活動資訊
□ 選擇參與成員
□ 活動狀態更新
□ 刪除活動功能
□ 權限控制正確
```

#### 3. 收費管理測試
```
□ 收費狀態更新
□ 批量更新功能
□ 手機操作流暢
□ 資料即時同步
□ 衝突檢測機制
□ 統計資料正確
```

#### 4. 手機裝置測試
```
□ iPhone Safari
□ Android Chrome
□ 觸控操作正常
□ 畫面大小適應
□ 載入速度可接受
□ 離線基本功能
```

### 效能測試

#### 1. Google Sheets API 效能
```bash
# 測試 API 回應時間
curl -w "@curl-format.txt" -s -o /dev/null "https://your-domain.com/api/events"

# 監控 API 配額使用
# 在 Google Cloud Console 檢查配額使用情況
```

#### 2. 前端效能
```bash
# 使用 Lighthouse 測試
npm install -g lighthouse
lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html

# 使用 WebPageTest
# 前往 https://www.webpagetest.org/ 進行測試
```

## 🐛 常見問題和解決方案

### 開發問題

#### 1. LINE Login 認證失敗
```
問題: 重導向到 LINE 後無法返回
解決:
1. 檢查 callback URL 設定
2. 確認 Channel ID 和 Secret 正確
3. 檢查 NEXTAUTH_URL 環境變數
4. 確認 LINE Channel 狀態為發布
```

#### 2. Google Sheets 寫入權限錯誤
```
問題: 403 Forbidden 或權限不足
解決:
1. 確認服務帳戶有寫入權限
2. 檢查 GOOGLE_SHEETS_SCOPE 環境變數
3. 重新產生服務帳戶金鑰
4. 確認試算表共用設定
```

#### 3. 快取同步問題
```
問題: 資料更新後前端未即時更新
解決:
1. 檢查快取清除邏輯
2. 確認 SWR mutate 調用
3. 檢查 ISR 重新驗證
4. 確認樂觀更新實作
```

### 部署問題

#### 1. Vercel 環境變數
```
問題: 環境變數在 Vercel 無法讀取
解決:
1. 確認變數名稱拼寫正確
2. 檢查是否設定到正確環境
3. 重新部署觸發更新
4. 檢查 Preview/Production 分別設定
```

#### 2. BUILD 錯誤
```
問題: TypeScript 編譯錯誤
解決:
1. 本地執行 npm run build 檢查
2. 確認所有型別定義正確
3. 檢查未使用的 imports
4. 確認環境變數型別聲明
```

## 📝 文件維護

### 開發文件更新
```
□ 完成功能後更新 API 文件
□ 記錄重要的設計決策
□ 更新資料庫架構圖
□ 撰寫使用者操作指南
□ 建立疑難排解 FAQ
```

### 程式碼文件
```
□ 重要函數加上 JSDoc 註解
□ 複雜邏輯添加說明註解
□ API 端點加上功能說明
□ 資料型別定義完整
□ 範例程式碼保持更新
```

---

**文件版本**: v1.0  
**建立日期**: 2025年8月17日  
**預期完成**: 2025年9月14日  
**負責開發**: 開發團隊  
**技術支援**: 參考相關技術文件