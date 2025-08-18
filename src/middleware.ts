import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // 管理員專用路由
    if (pathname.startsWith('/management')) {
      if (!token?.lineUserId) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      // 這裡之後可以加入更詳細的角色檢查
    }

    // 收費員專用路由
    if (pathname.startsWith('/collection')) {
      if (!token?.lineUserId) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // 個人頁面
    if (pathname.startsWith('/my')) {
      if (!token?.lineUserId) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // API 路由權限檢查在各自的 handler 中處理
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 對於需要認證的路由，確保有 token
        const pathname = req.nextUrl.pathname
        
        if (pathname.startsWith('/management') || 
            pathname.startsWith('/collection') || 
            pathname.startsWith('/my')) {
          return !!token?.lineUserId
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/management/:path*',
    '/collection/:path*',
    '/my/:path*',
    '/api/events/:path*',
    '/api/payments/:path*',
    '/api/members/:path*'
  ]
}