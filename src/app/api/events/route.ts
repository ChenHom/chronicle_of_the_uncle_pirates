import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/permissions'
import { sheetsDB } from '@/lib/sheets-database'
import { CreateEventRequest, CreateEventResponse } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    
    const searchParams = request.nextUrl.searchParams
    const statusFilter = searchParams.get('status')
    
    const events = await sheetsDB.getEvents()
    
    // 根據狀態篩選
    const filteredEvents = statusFilter 
      ? events.filter(event => event.status === statusFilter)
      : events
    
    return NextResponse.json({
      success: true,
      events: filteredEvents,
      total: filteredEvents.length
    })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '獲取活動列表失敗' 
      },
      { status: error instanceof Error && error.message === '請先登入' ? 401 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    
    const body: CreateEventRequest = await request.json()
    
    // 驗證必要欄位
    if (!body.eventName || !body.eventDate || !body.requiredAmount) {
      return NextResponse.json(
        { 
          success: false,
          error: '缺少必要欄位' 
        },
        { status: 400 }
      )
    }
    
    if (!body.participantLineUserIds || body.participantLineUserIds.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: '請至少選擇一位參與成員' 
        },
        { status: 400 }
      )
    }
    
    // 產生活動 ID
    const eventID = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 建立活動
    await sheetsDB.createEvent({
      eventID,
      eventName: body.eventName,
      eventDate: body.eventDate,
      eventType: body.eventType,
      requiredAmount: body.requiredAmount,
      description: body.description,
      participantLineUserIds: body.participantLineUserIds,
      createdBy: user.realName || user.name || 'Unknown'
    })
    
    const response: CreateEventResponse = {
      success: true,
      eventID,
      message: '活動建立成功',
      participantsAdded: body.participantLineUserIds.length
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('POST /api/events error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '建立活動失敗' 
      },
      { status: error instanceof Error && error.message.includes('權限') ? 403 : 500 }
    )
  }
}