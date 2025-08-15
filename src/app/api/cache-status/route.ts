import { NextResponse } from 'next/server';
import { cacheManager } from '@/lib/sheets';

export async function GET() {
  // 只在開發環境中提供快取狀態
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const cacheInfo = cacheManager.getCacheInfo();

    return NextResponse.json(cacheInfo, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 提供清除快取的端點
export async function DELETE(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    cacheManager.clear(key || undefined);

    return NextResponse.json({ 
      success: true, 
      message: key ? `Cleared cache for: ${key}` : 'Cleared all cache' 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}