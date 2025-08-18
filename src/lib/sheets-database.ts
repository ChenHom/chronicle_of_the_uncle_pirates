import { google } from 'googleapis'
import type { 
  AuthorizedMember, 
  RegisteredMember, 
  PendingRegistration 
} from '@/types/auth'
import type { 
  Event, 
  PaymentRecord
} from '@/types/database'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Cache store (共用現有的快取系統)
const cache = new Map<string, { data: unknown; timestamp: number }>()

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
  if (isExpired) {
    cache.delete(key)
    return null
  }
  
  return cached.data as T
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

function clearCacheByPattern(pattern: string): void {
  for (const [key] of cache) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// 初始化 Google Sheets 客戶端 (支援寫入)
function getSheetsClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.GOOGLE_PRIVATE_KEY!
  
  if (!serviceAccountEmail || !privateKey) {
    console.warn('⚠️  Google Sheets credentials not found')
    return null
  }

  // Fix private key format
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  privateKey = privateKey.replace(/\\n/g, '\n')

  // 升級權限範圍以支援寫入
  const scopes = process.env.GOOGLE_SHEETS_SCOPE || 'https://www.googleapis.com/auth/spreadsheets'

  const jwt = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: [scopes],
  })

  return google.sheets({ version: 'v4', auth: jwt })
}

// 工作表管理類
export class SheetsDatabase {
  private spreadsheetId: string

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID!
  }

  // ============ 授權成員管理 ============
  
  async getAuthorizedMembers(): Promise<AuthorizedMember[]> {
    const cacheKey = 'authorized-members'
    const cached = getCachedData<AuthorizedMember[]>(cacheKey)
    if (cached) return cached

    try {
      const sheets = getSheetsClient()
      if (!sheets) return []

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: '可註冊人員列表!A2:J', // 跳過標題行
      })

      const rows = response.data.values || []
      const members: AuthorizedMember[] = rows.map((row): AuthorizedMember => ({
        id: parseInt(row[0]) || 0,
        realName: row[1] || '',
        lineDisplayName: row[2] || undefined,
        phone: row[3] || undefined,
        role: (row[4] as 'admin' | 'collector' | 'member') || 'member',
        department: row[5] || undefined,
        authorizedBy: row[6] || '',
        authorizedDate: row[7] || '',
        status: (row[8] as 'active' | 'inactive') || 'active',
        notes: row[9] || undefined,
      }))

      setCachedData(cacheKey, members)
      return members
    } catch (error) {
      console.error('Error fetching authorized members:', error)
      return []
    }
  }

  async addAuthorizedMember(member: Omit<AuthorizedMember, 'id'>): Promise<number> {
    try {
      const sheets = getSheetsClient()
      if (!sheets) throw new Error('Sheets client not available')

      // 取得下一個 ID
      const existingMembers = await this.getAuthorizedMembers()
      const nextId = Math.max(...existingMembers.map(m => m.id), 0) + 1

      const values = [[
        nextId,
        member.realName,
        member.lineDisplayName || '',
        member.phone || '',
        member.role,
        member.department || '',
        member.authorizedBy,
        member.authorizedDate,
        member.status,
        member.notes || ''
      ]]

      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: '可註冊人員列表!A:J',
        valueInputOption: 'RAW',
        requestBody: { values }
      })

      // 清除快取
      clearCacheByPattern('authorized-members')
      
      return nextId
    } catch (error) {
      console.error('Error adding authorized member:', error)
      throw error
    }
  }

  // ============ 已註冊成員管理 ============
  
  async getRegisteredMembers(): Promise<RegisteredMember[]> {
    const cacheKey = 'registered-members'
    const cached = getCachedData<RegisteredMember[]>(cacheKey)
    if (cached) return cached

    try {
      const sheets = getSheetsClient()
      if (!sheets) return []

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: '已註冊成員!A2:J',
      })

      const rows = response.data.values || []
      const members: RegisteredMember[] = rows.map((row): RegisteredMember => ({
        memberID: parseInt(row[0]) || 0,
        lineUserID: row[1] || '',
        lineDisplayName: row[2] || '',
        linePictureURL: row[3] || undefined,
        realName: row[4] || '',
        role: (row[5] as 'admin' | 'collector' | 'member') || 'member',
        registerDate: row[6] || '',
        lastLoginDate: row[7] || '',
        status: (row[8] as 'active' | 'inactive') || 'active',
        matchedFromID: parseInt(row[9]) || 0,
      }))

      setCachedData(cacheKey, members)
      return members
    } catch (error) {
      console.error('Error fetching registered members:', error)
      return []
    }
  }

  async findRegisteredMemberByLineId(lineUserId: string): Promise<RegisteredMember | null> {
    const members = await this.getRegisteredMembers()
    return members.find(member => member.lineUserID === lineUserId) || null
  }

  async addRegisteredMember(member: Omit<RegisteredMember, 'memberID'>): Promise<number> {
    try {
      const sheets = getSheetsClient()
      if (!sheets) throw new Error('Sheets client not available')

      // 取得下一個 ID
      const existingMembers = await this.getRegisteredMembers()
      const nextId = Math.max(...existingMembers.map(m => m.memberID), 0) + 1

      const values = [[
        nextId,
        member.lineUserID,
        member.lineDisplayName,
        member.linePictureURL || '',
        member.realName,
        member.role,
        member.registerDate,
        member.lastLoginDate,
        member.status,
        member.matchedFromID
      ]]

      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: '已註冊成員!A:J',
        valueInputOption: 'RAW',
        requestBody: { values }
      })

      // 清除快取
      clearCacheByPattern('registered-members')
      
      return nextId
    } catch (error) {
      console.error('Error adding registered member:', error)
      throw error
    }
  }

  async updateMemberLastLogin(lineUserId: string, loginTime: string): Promise<void> {
    try {
      const sheets = getSheetsClient()
      if (!sheets) throw new Error('Sheets client not available')

      // 先找到成員的行號
      const members = await this.getRegisteredMembers()
      const memberIndex = members.findIndex(m => m.lineUserID === lineUserId)
      if (memberIndex === -1) return

      const rowNumber = memberIndex + 2 // +2 因為有標題行且索引從 0 開始
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `已註冊成員!H${rowNumber}`, // H 欄是 lastLoginDate
        valueInputOption: 'RAW',
        requestBody: {
          values: [[loginTime]]
        }
      })

      // 清除快取
      clearCacheByPattern('registered-members')
    } catch (error) {
      console.error('Error updating last login:', error)
      throw error
    }
  }

  async createEvent(eventData: {
    eventID: string
    eventName: string
    eventDate: string
    eventType: '比賽' | '聚餐' | '其他'
    requiredAmount: number
    description?: string
    participantLineUserIds: string[]
    createdBy: string
  }): Promise<void> {
    try {
      const sheets = getSheetsClient()
      if (!sheets) throw new Error('Sheets client not available')

      const now = new Date().toISOString()
      
      // 新增活動到活動管理工作表
      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: '活動管理!A:L',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            eventData.eventID,
            eventData.eventName,
            eventData.eventDate,
            eventData.eventType,
            eventData.requiredAmount,
            eventData.description || '',
            'planning', // status
            eventData.createdBy,
            now, // createdDate
            now, // updatedDate
            eventData.participantLineUserIds.length, // participantCount
            0, // collectedAmount
          ]]
        }
      })

      // 為每個參與者建立收費追蹤記錄
      const trackingRecords = eventData.participantLineUserIds.map(lineUserId => {
        const trackingID = `track_${eventData.eventID}_${lineUserId}_${Date.now()}`
        return [
          trackingID,
          eventData.eventID,
          lineUserId, // memberLineUserID (會需要從 registered members 中找到對應的 realName)
          '', // memberDisplayName (暫時空白，之後可以填入)
          eventData.requiredAmount, // requiredAmount
          0, // paidAmount
          'unpaid', // paymentStatus
          '', // paymentDate
          '', // collectedBy
          '', // collectorName
          '', // paymentMethod
          '', // notes
          now, // createdDate
          now, // updatedDate
        ]
      })

      if (trackingRecords.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: '收費追蹤!A:N',
          valueInputOption: 'RAW',
          requestBody: {
            values: trackingRecords
          }
        })
      }

      // 清除相關快取
      clearCacheByPattern('events')
      clearCacheByPattern('payment-tracking')
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async updatePaymentRecord(trackingID: string, updateData: {
    paidAmount: number
    paymentStatus: 'unpaid' | 'partial' | 'paid'
    paymentDate?: string
    collectedBy?: string
    collectorName?: string
    paymentMethod?: string
    notes?: string
  }): Promise<void> {
    try {
      const sheets = getSheetsClient()
      if (!sheets) throw new Error('Sheets client not available')

      // 先找到付款記錄的行號
      const paymentRecords = await this.getPaymentTracking()
      const recordIndex = paymentRecords.findIndex(p => p.trackingID === trackingID)
      if (recordIndex === -1) {
        throw new Error('找不到指定的付款記錄')
      }

      const rowNumber = recordIndex + 2 // +2 因為有標題行且索引從 0 開始
      const now = new Date().toISOString()
      
      // 更新付款記錄
      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `收費追蹤!E${rowNumber}:N${rowNumber}`, // E 到 N 欄位
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            updateData.paidAmount, // E: paidAmount
            updateData.paymentStatus, // F: paymentStatus
            updateData.paymentDate || '', // G: paymentDate
            updateData.collectedBy || '', // H: collectedBy
            updateData.collectorName || '', // I: collectorName
            updateData.paymentMethod || '', // J: paymentMethod
            updateData.notes || '', // K: notes
            paymentRecords[recordIndex].createdDate, // L: createdDate (保持原值)
            now, // M: updatedDate
            // N: canEdit 欄位保持原值或由其他邏輯決定
          ]]
        }
      })

      // 清除相關快取
      clearCacheByPattern('payment-tracking')
      clearCacheByPattern('events') // 因為事件統計會受影響
    } catch (error) {
      console.error('Error updating payment record:', error)
      throw error
    }
  }

  // ============ 待審核申請管理 ============
  
  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    const cacheKey = 'pending-registrations'
    const cached = getCachedData<PendingRegistration[]>(cacheKey)
    if (cached) return cached

    try {
      const sheets = getSheetsClient()
      if (!sheets) return []

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: '待審核申請!A2:J',
      })

      const rows = response.data.values || []
      const requests: PendingRegistration[] = rows.map((row): PendingRegistration => ({
        requestID: parseInt(row[0]) || 0,
        lineUserID: row[1] || '',
        lineDisplayName: row[2] || '',
        linePictureURL: row[3] || undefined,
        requestDate: row[4] || '',
        status: (row[5] as 'pending' | 'approved' | 'rejected') || 'pending',
        reviewedBy: row[6] || undefined,
        reviewDate: row[7] || undefined,
        selectedAuthorizedID: parseInt(row[8]) || undefined,
        notes: row[9] || undefined,
      }))

      setCachedData(cacheKey, requests)
      return requests
    } catch (error) {
      console.error('Error fetching pending registrations:', error)
      return []
    }
  }

  async addPendingRegistration(request: Omit<PendingRegistration, 'requestID'>): Promise<number> {
    try {
      const sheets = getSheetsClient()
      if (!sheets) throw new Error('Sheets client not available')

      // 取得下一個 ID
      const existingRequests = await this.getPendingRegistrations()
      const nextId = Math.max(...existingRequests.map(r => r.requestID), 0) + 1

      const values = [[
        nextId,
        request.lineUserID,
        request.lineDisplayName,
        request.linePictureURL || '',
        request.requestDate,
        request.status,
        request.reviewedBy || '',
        request.reviewDate || '',
        request.selectedAuthorizedID || '',
        request.notes || ''
      ]]

      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: '待審核申請!A:J',
        valueInputOption: 'RAW',
        requestBody: { values }
      })

      // 清除快取
      clearCacheByPattern('pending-registrations')
      
      return nextId
    } catch (error) {
      console.error('Error adding pending registration:', error)
      throw error
    }
  }

  // ============ 活動管理 ============
  
  async getEvents(): Promise<Event[]> {
    const cacheKey = 'events'
    const cached = getCachedData<Event[]>(cacheKey)
    if (cached) return cached

    try {
      const sheets = getSheetsClient()
      if (!sheets) return []

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: '活動管理!A2:L',
      })

      const rows = response.data.values || []
      const events: Event[] = rows.map((row): Event => ({
        eventID: row[0] || '',
        eventName: row[1] || '',
        eventDate: row[2] || '',
        eventType: (row[3] as '比賽' | '聚餐' | '其他') || '其他',
        requiredAmount: parseFloat(row[4]) || 0,
        description: row[5] || undefined,
        status: (row[6] as 'planning' | 'active' | 'completed' | 'cancelled') || 'planning',
        createdBy: row[7] || '',
        createdDate: row[8] || '',
        updatedDate: row[9] || '',
        participantCount: parseInt(row[10]) || 0,
        collectedAmount: parseFloat(row[11]) || 0,
      }))

      setCachedData(cacheKey, events)
      return events
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  }

  // ============ 收費追蹤 ============
  
  async getPaymentTracking(eventId?: string): Promise<PaymentRecord[]> {
    const cacheKey = eventId ? `payment-tracking-${eventId}` : 'payment-tracking-all'
    const cached = getCachedData<PaymentRecord[]>(cacheKey)
    if (cached) return cached

    try {
      const sheets = getSheetsClient()
      if (!sheets) return []

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: '收費追蹤!A2:N',
      })

      const rows = response.data.values || []
      let records: PaymentRecord[] = rows.map((row): PaymentRecord => ({
        trackingID: row[0] || '',
        eventID: row[1] || '',
        memberLineUserID: row[2] || '',
        memberDisplayName: row[3] || '',
        requiredAmount: parseFloat(row[4]) || 0,
        paidAmount: parseFloat(row[5]) || 0,
        paymentStatus: (row[6] as 'unpaid' | 'partial' | 'paid') || 'unpaid',
        paymentDate: row[7] || undefined,
        collectedBy: row[8] || undefined,
        collectorName: row[9] || undefined,
        paymentMethod: (row[10] as 'cash' | 'transfer' | 'other') || undefined,
        notes: row[11] || undefined,
        createdDate: row[12] || '',
        updatedDate: row[13] || '',
      }))

      // 如果指定了 eventId，只返回該活動的記錄
      if (eventId) {
        records = records.filter(record => record.eventID === eventId)
      }

      setCachedData(cacheKey, records)
      return records
    } catch (error) {
      console.error('Error fetching payment tracking:', error)
      return []
    }
  }

  // ============ 快取管理 ============
  
  clearCache(pattern?: string): void {
    if (pattern) {
      clearCacheByPattern(pattern)
    } else {
      cache.clear()
    }
  }

  getCacheInfo() {
    const entries = Array.from(cache.entries()).map(([key, value]) => ({
      key,
      age: Math.floor((Date.now() - value.timestamp) / 1000),
      remainingSeconds: Math.floor((CACHE_DURATION - (Date.now() - value.timestamp)) / 1000)
    }))
    return entries
  }
}

// 匯出單例實例
export const sheetsDB = new SheetsDatabase()