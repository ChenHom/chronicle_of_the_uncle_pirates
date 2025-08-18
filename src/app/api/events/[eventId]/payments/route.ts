import { NextRequest, NextResponse } from 'next/server'
import { requireCollector } from '@/lib/permissions'
import { sheetsDB } from '@/lib/sheets-database'
import { PaymentListResponse, PaymentSummary } from '@/types/database'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await requireCollector()
    const { eventId } = await context.params
    
    // 取得活動資訊
    const events = await sheetsDB.getEvents()
    const event = events.find(e => e.eventID === eventId)
    
    if (!event) {
      return NextResponse.json(
        { 
          success: false,
          error: '找不到指定的活動' 
        },
        { status: 404 }
      )
    }
    
    // 取得收費記錄
    const paymentTracking = await sheetsDB.getPaymentTracking()
    const eventPayments = paymentTracking.filter(p => p.eventID === eventId)
    
    // 計算統計資料
    const totalRequired = eventPayments.reduce((sum, p) => sum + p.requiredAmount, 0)
    const totalCollected = eventPayments.reduce((sum, p) => sum + p.paidAmount, 0)
    const unpaidCount = eventPayments.filter(p => p.paymentStatus === 'unpaid').length
    const partialCount = eventPayments.filter(p => p.paymentStatus === 'partial').length
    const paidCount = eventPayments.filter(p => p.paymentStatus === 'paid').length
    const collectionRate = totalRequired > 0 ? (totalCollected / totalRequired) * 100 : 0
    
    const summary: PaymentSummary = {
      totalRequired,
      totalCollected,
      unpaidCount,
      partialCount,
      paidCount,
      collectionRate
    }
    
    const response: PaymentListResponse = {
      eventInfo: {
        eventID: event.eventID,
        eventName: event.eventName,
        eventDate: event.eventDate,
        requiredAmount: event.requiredAmount
      },
      payments: eventPayments,
      summary
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('GET /api/events/[eventId]/payments error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '載入收費資料失敗' 
      },
      { status: error instanceof Error && error.message.includes('權限') ? 403 : 500 }
    )
  }
}