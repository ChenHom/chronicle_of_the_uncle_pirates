import { NextRequest, NextResponse } from 'next/server'
import { requireCollector } from '@/lib/permissions'
import { sheetsDB } from '@/lib/sheets-database'
import { UpdatePaymentRequest, UpdatePaymentResponse } from '@/types/database'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ trackingId: string }> }
) {
  try {
    const user = await requireCollector()
    const { trackingId } = await context.params
    const body: UpdatePaymentRequest = await request.json()
    
    // 驗證必要欄位
    if (body.paidAmount < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: '繳費金額不能為負數' 
        },
        { status: 400 }
      )
    }
    
    // 先取得現有記錄來確定狀態
    const currentRecords = await sheetsDB.getPaymentTracking()
    const currentRecord = currentRecords.find(p => p.trackingID === trackingId)
    
    if (!currentRecord) {
      return NextResponse.json(
        { 
          success: false,
          error: '找不到指定的付款記錄' 
        },
        { status: 404 }
      )
    }
    
    // 判斷付款狀態
    let paymentStatus: 'unpaid' | 'partial' | 'paid'
    if (body.paidAmount === 0) {
      paymentStatus = 'unpaid'
    } else if (body.paidAmount >= currentRecord.requiredAmount) {
      paymentStatus = 'paid'
    } else {
      paymentStatus = 'partial'
    }
    
    // 更新收費記錄
    await sheetsDB.updatePaymentRecord(trackingId, {
      paidAmount: body.paidAmount,
      paymentStatus,
      paymentDate: body.paymentDate || new Date().toISOString(),
      collectedBy: user.lineUserId,
      collectorName: user.realName || user.name || 'Unknown',
      paymentMethod: body.paymentMethod,
      notes: body.notes
    })
    
    const updatedRecord = {
      ...currentRecord,
      paidAmount: body.paidAmount,
      paymentStatus,
      paymentDate: body.paymentDate || new Date().toISOString(),
      collectedBy: user.lineUserId,
      collectorName: user.realName || user.name || 'Unknown',
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      updatedDate: new Date().toISOString()
    }
    
    const response: UpdatePaymentResponse = {
      success: true,
      message: '收費記錄更新成功',
      updatedRecord
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('PUT /api/payments/[trackingId] error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '更新收費記錄失敗' 
      },
      { status: error instanceof Error && error.message.includes('權限') ? 403 : 500 }
    )
  }
}