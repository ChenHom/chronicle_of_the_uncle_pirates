// 資料庫相關型別定義

export interface Event {
  eventID: string
  eventName: string
  eventDate: string
  eventType: '比賽' | '聚餐' | '其他'
  requiredAmount: number
  description?: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  createdBy: string
  createdDate: string
  updatedDate: string
  participantCount: number
  collectedAmount: number
  collectionProgress?: number // 0-100
}

export interface PaymentRecord {
  trackingID: string
  eventID: string
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
  createdDate: string
  updatedDate: string
  canEdit?: boolean // 根據使用者權限決定
}

export interface Transaction {
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

export interface Album {
  albumID: string
  title: string
  date: string
  description: string
  coverImageURL: string
  albumURL: string
}

// API 請求/回應型別
export interface CreateEventRequest {
  eventName: string
  eventDate: string // YYYY-MM-DD
  eventType: '比賽' | '聚餐' | '其他'
  requiredAmount: number
  description?: string
  participantLineUserIds: string[] // 參與成員的 LINE User ID
}

export interface CreateEventResponse {
  success: boolean
  eventID: string
  message: string
  participantsAdded: number
}

export interface UpdateEventRequest {
  eventName?: string
  eventDate?: string
  eventType?: '比賽' | '聚餐' | '其他'
  requiredAmount?: number
  description?: string
  status?: 'planning' | 'active' | 'completed' | 'cancelled'
}

export interface UpdatePaymentRequest {
  paidAmount: number
  paymentMethod: 'cash' | 'transfer' | 'other'
  paymentDate?: string // 預設為當前時間
  notes?: string
  lastUpdated: string // 樂觀鎖定
}

export interface UpdatePaymentResponse {
  success: boolean
  message: string
  updatedRecord: PaymentRecord
  conflictDetected?: boolean
}

export interface BatchUpdateRequest {
  updates: Array<{
    trackingID: string
    paidAmount: number
    paymentMethod: 'cash' | 'transfer' | 'other'
    notes?: string
  }>
  collectorNotes?: string
}

export interface BatchUpdateResponse {
  success: boolean
  totalUpdated: number
  failed: Array<{
    trackingID: string
    error: string
  }>
  summary: PaymentSummary
}

export interface AddParticipantsRequest {
  participantLineUserIds: string[]
  customAmount?: number // 如果不同於活動預設金額
}

export interface GenerateTransactionsRequest {
  eventID: string
  description?: string // 預設為活動名稱
  handler: string // 經手人名稱
}

export interface GenerateTransactionsResponse {
  success: boolean
  transactionsCreated: number
  totalAmount: number
  transactionIDs: string[]
}

// 統計相關型別
export interface PaymentSummary {
  totalRequired: number
  totalCollected: number
  unpaidCount: number
  partialCount: number
  paidCount: number
  collectionRate: number // 0-100
}

export interface EventsResponse {
  events: Event[]
  total: number
  hasMore: boolean
}

export interface PaymentListResponse {
  eventInfo: {
    eventID: string
    eventName: string
    eventDate: string
    requiredAmount: number
  }
  payments: PaymentRecord[]
  summary: PaymentSummary
}

export interface EventDetailResponse {
  event: Event
  participants: PaymentRecord[]
  paymentSummary: PaymentSummary
}

// 報表相關型別
export interface EventSummaryReport {
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

export interface MemberHistoryReport {
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

// 系統狀態相關
export interface SystemStatus {
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

export interface ClearCacheRequest {
  cacheKeys?: string[] // 特定 key，空值表示全部清除
  forceRefresh?: boolean
}