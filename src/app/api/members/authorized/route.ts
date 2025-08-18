import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/permissions'
import { sheetsDB } from '@/lib/sheets-database'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    
    const members = await sheetsDB.getAuthorizedMembers()
    
    return NextResponse.json({
      success: true,
      members
    })
  } catch (error) {
    console.error('GET /api/members/authorized error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '獲取成員清單失敗' 
      },
      { status: error instanceof Error && error.message === '請先登入' ? 401 : 500 }
    )
  }
}