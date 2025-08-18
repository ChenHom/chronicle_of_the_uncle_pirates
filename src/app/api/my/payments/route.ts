import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { sheetsDB } from '@/lib/sheets-database'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // 取得所有收費記錄
    const allPayments = await sheetsDB.getPaymentTracking()
    
    // 篩選出該使用者的記錄
    const myPayments = allPayments.filter(payment => 
      payment.memberLineUserID === user.lineUserId
    )
    
    return NextResponse.json({
      success: true,
      payments: myPayments
    })
  } catch (error) {
    console.error('GET /api/my/payments error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '載入個人繳費記錄失敗' 
      },
      { status: error instanceof Error && error.message === '請先登入' ? 401 : 500 }
    )
  }
}