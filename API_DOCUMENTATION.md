# API 設計文件

## 📡 API 總覽

本文件定義收費管理系統的所有 API 端點，包括認證、權限控制、資料操作和回應格式。

**基礎 URL**: `https://your-domain.com/api`  
**認證方式**: NextAuth.js Session Token  
**資料格式**: JSON  
**字元編碼**: UTF-8

## 🔐 認證相關 API

### NextAuth.js 內建端點

| 端點 | 方法 | 說明 |
|-----|------|------|
| `/api/auth/signin` | GET | 登入頁面 |
| `/api/auth/callback/line` | GET/POST | LINE OAuth 回調 |
| `/api/auth/signout` | POST | 登出 |
| `/api/auth/session` | GET | 取得當前 Session |
| `/api/auth/csrf` | GET | 取得 CSRF Token |

### 自定義認證端點

#### GET `/api/me`
取得當前使用者資訊

**請求標頭**:
```
Cookie: next-auth.session-token=xxx
```

**回應格式**:
```typescript
interface UserInfo {
  id: string
  name: string
  image?: string
  role: 'admin' | 'collector' | 'member'
  lineUserId: string
  realName: string
  permissions: string[]
}
```

**回應範例**:
```json
{
  "id": "1",
  "name": "王小明",
  "image": "https://profile.line-scdn.net/...",
  "role": "admin",
  "lineUserId": "U1234567890abcdef",
  "realName": "王小明",
  "permissions": ["create_event", "manage_members", "collect_payment", "view_all"]
}
```

#### POST `/api/auth/approve-registration`
管理員審核註冊申請

**權限要求**: `admin`

**請求格式**:
```typescript
interface ApprovalRequest {
  requestId: number
  selectedAuthorizedId: number
  action: 'approve' | 'reject'
  notes?: string
}
```

**回應格式**:
```typescript
interface ApprovalResponse {
  success: boolean
  message: string
  newMemberId?: number
}
```

## 👥 成員管理 API

#### GET `/api/members`
取得成員列表

**權限要求**: `manage_members` 或 `view_all`

**查詢參數**:
```
?status=active|inactive|all (預設: active)
?role=admin|collector|member|all (預設: all)
?limit=20 (預設: 100)
?offset=0 (預設: 0)
```

**回應格式**:
```typescript
interface MembersResponse {
  members: Member[]
  total: number
  hasMore: boolean
}

interface Member {
  memberID: number
  lineUserID: string
  lineDisplayName: string
  linePictureURL?: string
  realName: string
  role: 'admin' | 'collector' | 'member'
  registerDate: string
  lastLoginDate: string
  status: 'active' | 'inactive'
}
```

#### POST `/api/members`
新增成員到可註冊清單

**權限要求**: `manage_members`

**請求格式**:
```typescript
interface CreateMemberRequest {
  realName: string
  lineDisplayName?: string
  phone?: string
  role: 'admin' | 'collector' | 'member'
  department?: string
  notes?: string
}
```

#### PUT `/api/members/[id]`
更新成員資訊

**權限要求**: `manage_members`

**請求格式**:
```typescript
interface UpdateMemberRequest {
  realName?: string
  role?: 'admin' | 'collector' | 'member'
  status?: 'active' | 'inactive'
  notes?: string
}
```

#### GET `/api/members/pending`
取得待審核申請列表

**權限要求**: `manage_members`

**回應格式**:
```typescript
interface PendingRegistration {
  requestID: number
  lineUserID: string
  lineDisplayName: string
  linePictureURL?: string
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  possibleMatches?: AuthorizedMember[]
}
```

## 🎯 活動管理 API

#### GET `/api/events`
取得活動列表

**權限要求**: `view_events` (所有使用者)

**查詢參數**:
```
?status=planning|active|completed|cancelled|all (預設: all)
?limit=20 (預設: 50)
?offset=0 (預設: 0)
?sortBy=eventDate|createdDate (預設: eventDate)
?sortOrder=asc|desc (預設: desc)
```

**回應格式**:
```typescript
interface EventsResponse {
  events: Event[]
  total: number
  hasMore: boolean
}

interface Event {
  eventID: string
  eventName: string
  eventDate: string
  eventType: '比賽' | '聚餐' | '其他'
  requiredAmount: number
  description?: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  createdBy: string
  createdDate: string
  participantCount: number
  collectedAmount: number
  collectionProgress: number // 0-100
}
```

#### POST `/api/events`
建立新活動

**權限要求**: `create_event`

**請求格式**:
```typescript
interface CreateEventRequest {
  eventName: string
  eventDate: string // YYYY-MM-DD
  eventType: '比賽' | '聚餐' | '其他'
  requiredAmount: number
  description?: string
  participantLineUserIds: string[] // 參與成員的 LINE User ID
}
```

**回應格式**:
```typescript
interface CreateEventResponse {
  success: boolean
  eventID: string
  message: string
  participantsAdded: number
}
```

#### PUT `/api/events/[eventId]`
更新活動資訊

**權限要求**: `create_event`

**請求格式**:
```typescript
interface UpdateEventRequest {
  eventName?: string
  eventDate?: string
  eventType?: '比賽' | '聚餐' | '其他'
  requiredAmount?: number
  description?: string
  status?: 'planning' | 'active' | 'completed' | 'cancelled'
}
```

#### GET `/api/events/[eventId]`
取得活動詳細資訊

**權限要求**: `view_events`

**回應格式**:
```typescript
interface EventDetailResponse {
  event: Event
  participants: Participant[]
  paymentSummary: PaymentSummary
}

interface Participant {
  trackingID: string
  memberLineUserID: string
  memberDisplayName: string
  requiredAmount: number
  paidAmount: number
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  paymentDate?: string
  collectedBy?: string
  collectorName?: string
}

interface PaymentSummary {
  totalRequired: number
  totalCollected: number
  unpaidCount: number
  partialCount: number
  paidCount: number
  collectionRate: number // 0-100
}
```

#### POST `/api/events/[eventId]/participants`
新增活動參與者

**權限要求**: `create_event`

**請求格式**:
```typescript
interface AddParticipantsRequest {
  participantLineUserIds: string[]
  customAmount?: number // 如果不同於活動預設金額
}
```

## 💰 收費管理 API

#### GET `/api/payments/[eventId]`
取得活動收費清單

**權限要求**: `collect_payment` 或 `view_all`

**查詢參數**:
```
?status=unpaid|partial|paid|all (預設: all)
?sortBy=memberName|paymentStatus|paymentDate (預設: memberName)
```

**回應格式**:
```typescript
interface PaymentListResponse {
  eventInfo: {
    eventID: string
    eventName: string
    eventDate: string
    requiredAmount: number
  }
  payments: PaymentRecord[]
  summary: PaymentSummary
}

interface PaymentRecord {
  trackingID: string
  memberLineUserID: string
  memberDisplayName: string
  requiredAmount: number
  paidAmount: number
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  paymentDate?: string
  collectedBy?: string
  collectorName?: string
  paymentMethod?: 'cash' | 'transfer' | 'other'
  notes?: string
  canEdit: boolean // 根據使用者權限決定
}
```

#### PUT `/api/payments/[trackingId]`
更新收費狀態

**權限要求**: `collect_payment`

**請求格式**:
```typescript
interface UpdatePaymentRequest {
  paidAmount: number
  paymentMethod: 'cash' | 'transfer' | 'other'
  paymentDate?: string // 預設為當前時間
  notes?: string
  lastUpdated: string // 樂觀鎖定
}
```

**回應格式**:
```typescript
interface UpdatePaymentResponse {
  success: boolean
  message: string
  updatedRecord: PaymentRecord
  conflictDetected?: boolean
}
```

#### POST `/api/payments/batch-update`
批量更新收費狀態

**權限要求**: `collect_payment`

**請求格式**:
```typescript
interface BatchUpdateRequest {
  updates: Array<{
    trackingID: string
    paidAmount: number
    paymentMethod: 'cash' | 'transfer' | 'other'
    notes?: string
  }>
  collectorNotes?: string
}
```

**回應格式**:
```typescript
interface BatchUpdateResponse {
  success: boolean
  totalUpdated: number
  failed: Array<{
    trackingID: string
    error: string
  }>
  summary: PaymentSummary
}
```

#### POST `/api/payments/generate-transactions`
產生交易記錄

**權限要求**: `create_event` (通常活動結束後執行)

**請求格式**:
```typescript
interface GenerateTransactionsRequest {
  eventID: string
  description?: string // 預設為活動名稱
  handler: string // 經手人名稱
}
```

**回應格式**:
```typescript
interface GenerateTransactionsResponse {
  success: boolean
  transactionsCreated: number
  totalAmount: number
  transactionIDs: string[]
}
```

## 💳 交易記錄 API

#### GET `/api/transactions`
取得交易記錄 (擴充現有 API)

**權限要求**: `view_all`

**查詢參數**:
```
?eventId=E2025001 (篩選特定活動)
?type=收入|支出|all (預設: all)
?dateFrom=2025-01-01
?dateTo=2025-12-31
?limit=50 (預設: 100)
?offset=0
```

**回應格式**: 保持現有格式，新增欄位
```typescript
interface Transaction {
  // 現有欄位...
  transactionID: string
  date: string
  description: string
  type: '收入' | '支出'
  amount: number
  handler: string
  receiptURL?: string
  balance: number
  // 新增欄位
  eventID?: string
  generatedFrom: 'PaymentTracking' | 'Manual'
  trackingID?: string
}
```

## 📊 統計報表 API

#### GET `/api/reports/event-summary/[eventId]`
活動收費統計報表

**權限要求**: `view_all` 或活動建立者

**回應格式**:
```typescript
interface EventSummaryReport {
  eventInfo: Event
  paymentStats: {
    totalParticipants: number
    totalRequired: number
    totalCollected: number
    collectionRate: number
    unpaidMembers: string[]
    averageCollectionTime: number // 平均收費天數
  }
  dailyProgress: Array<{
    date: string
    collectedAmount: number
    cumulativeAmount: number
    paidCount: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
}
```

#### GET `/api/reports/member-history/[lineUserId]`
成員繳費歷史

**權限要求**: `view_all` 或本人

**回應格式**:
```typescript
interface MemberHistoryReport {
  memberInfo: {
    lineUserID: string
    realName: string
    totalEvents: number
    totalPaid: number
  }
  paymentHistory: Array<{
    eventID: string
    eventName: string
    eventDate: string
    requiredAmount: number
    paidAmount: number
    paymentStatus: string
    paymentDate?: string
    daysToPayment?: number
  }>
  statistics: {
    onTimePaymentRate: number
    averagePaymentDays: number
    totalOwed: number
  }
}
```

## 🔧 系統管理 API

#### GET `/api/admin/system-status`
系統狀態檢查

**權限要求**: `admin`

**回應格式**:
```typescript
interface SystemStatus {
  googleSheetsApi: {
    status: 'ok' | 'error'
    lastChecked: string
    quotaUsage: number // 0-100
    errorCount: number
  }
  cacheStatus: {
    memoryUsage: number // MB
    hitRate: number // 0-100
    totalKeys: number
  }
  authentication: {
    activeUsers: number
    pendingRegistrations: number
    failedLogins: number
  }
  database: {
    totalEvents: number
    activeEvents: number
    totalMembers: number
    lastBackup: string
  }
}
```

#### POST `/api/admin/clear-cache`
清除快取

**權限要求**: `admin`

**請求格式**:
```typescript
interface ClearCacheRequest {
  cacheKeys?: string[] // 特定 key，空值表示全部清除
  forceRefresh?: boolean
}
```

#### GET `/api/admin/audit-logs`
取得操作日誌

**權限要求**: `admin`

**查詢參數**:
```
?action=login|payment|admin (預設: all)
?userId=U1234567890abcdef
?dateFrom=2025-01-01
?dateTo=2025-12-31
?limit=100
```

## 🚨 錯誤回應格式

### 標準錯誤格式
```typescript
interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
  timestamp: string
  requestId: string
}
```

### 常見錯誤代碼

| HTTP 狀態 | 錯誤代碼 | 說明 |
|----------|---------|------|
| 400 | `INVALID_REQUEST` | 請求格式錯誤 |
| 401 | `UNAUTHORIZED` | 未認證 |
| 403 | `FORBIDDEN` | 權限不足 |
| 404 | `NOT_FOUND` | 資源不存在 |
| 409 | `CONFLICT` | 資料衝突 |
| 429 | `RATE_LIMIT` | 請求頻率過高 |
| 500 | `INTERNAL_ERROR` | 伺服器內部錯誤 |
| 503 | `SERVICE_UNAVAILABLE` | 服務暫時不可用 |

### 錯誤回應範例
```json
{
  "error": "FORBIDDEN",
  "message": "您沒有權限執行此操作",
  "code": "INSUFFICIENT_PERMISSIONS",
  "details": {
    "requiredPermission": "manage_members",
    "userRole": "member"
  },
  "timestamp": "2025-08-17T14:30:00.000Z",
  "requestId": "req_abc123def456"
}
```

## 📝 API 使用範例

### 前端使用範例

#### 使用 React Hook 獲取資料
```typescript
// hooks/useEvents.ts
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useEvents(status?: string) {
  const { data, error, mutate } = useSWR(
    `/api/events${status ? `?status=${status}` : ''}`,
    fetcher
  )
  
  return {
    events: data?.events || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}

// 使用方式
function EventList() {
  const { events, isLoading, isError } = useEvents('active')
  
  if (isLoading) return <div>載入中...</div>
  if (isError) return <div>載入失敗</div>
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.eventID} event={event} />
      ))}
    </div>
  )
}
```

#### 更新收費狀態
```typescript
// utils/api.ts
export async function updatePaymentStatus(
  trackingId: string, 
  updateData: UpdatePaymentRequest
) {
  const response = await fetch(`/api/payments/${trackingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }
  
  return response.json()
}

// 使用方式
async function handlePaymentUpdate(trackingId: string, amount: number) {
  try {
    await updatePaymentStatus(trackingId, {
      paidAmount: amount,
      paymentMethod: 'cash',
      lastUpdated: new Date().toISOString()
    })
    
    toast.success('收費狀態已更新')
    refresh() // 重新載入資料
  } catch (error) {
    toast.error(`更新失敗: ${error.message}`)
  }
}
```

## 🔄 版本控制

### API 版本策略
- 當前版本: `v1`
- 向後相容性: 6個月
- 棄用通知: 提前3個月
- 版本標示: URL 路徑 `/api/v1/...` (目前省略，預設 v1)

### 變更日誌
```
v1.0.0 (2025-08-17):
- 初始 API 設計
- 基本 CRUD 操作
- LINE 認證整合
- 權限控制系統
```

---

**文件版本**: v1.0  
**建立日期**: 2025年8月17日  
**最後更新**: 2025年8月17日  
**維護負責**: 開發團隊  
**相關文件**: PAYMENT_SYSTEM_DESIGN.md, AUTH_FLOW.md, DATABASE_SCHEMA.md