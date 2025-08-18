import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/permissions'
import { sheetsDB } from '@/lib/sheets-database'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    
    // 平行載入各種統計資料
    const [events, authorizedMembers, registeredMembers, pendingRegistrations] = await Promise.all([
      sheetsDB.getEvents(),
      sheetsDB.getAuthorizedMembers(),
      sheetsDB.getRegisteredMembers(),
      sheetsDB.getPendingRegistrations()
    ])
    
    // 計算統計數據
    const totalEvents = events.length
    const activeEvents = events.filter(event => event.status === 'active').length
    const totalMembers = registeredMembers.length
    const pendingCount = pendingRegistrations.length
    
    // 計算總收費金額和完成率
    const totalAmount = events.reduce((sum, event) => sum + (event.collectedAmount || 0), 0)
    const totalRequired = events.reduce((sum, event) => sum + (event.requiredAmount * event.participantCount), 0)
    const collectionRate = totalRequired > 0 ? (totalAmount / totalRequired) * 100 : 0
    
    const stats = {
      totalEvents,
      activeEvents,
      totalMembers,
      pendingRegistrations: pendingCount,
      totalAmount,
      collectionRate
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('GET /api/management/dashboard error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '載入儀表板資料失敗' 
      },
      { status: error instanceof Error && error.message === '請先登入' ? 401 : 500 }
    )
  }
}