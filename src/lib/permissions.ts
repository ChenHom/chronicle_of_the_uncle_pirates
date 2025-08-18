import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sheetsDB } from '@/lib/sheets-database'
import { UserRole } from '@/types/auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.lineUserId) {
    return null
  }
  
  // 從資料庫取得使用者資訊
  const registeredUser = await sheetsDB.findRegisteredMemberByLineId(session.user.lineUserId)
  
  if (!registeredUser) {
    return {
      ...session.user,
      role: null,
      isRegistered: false
    }
  }
  
  return {
    ...session.user,
    role: registeredUser.role,
    isRegistered: true,
    memberID: registeredUser.memberID,
    realName: registeredUser.realName
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('請先登入')
  }
  
  if (!user.isRegistered) {
    throw new Error('帳戶尚未註冊或審核中')
  }
  
  return user
}

export async function requireRole(requiredRoles: UserRole[]) {
  const user = await requireAuth()
  
  if (!user.role || !requiredRoles.includes(user.role)) {
    throw new Error('權限不足')
  }
  
  return user
}

export async function requireAdmin() {
  return await requireRole(['admin'])
}

export async function requireCollector() {
  return await requireRole(['admin', 'collector'])
}

// 權限檢查函數
export function canManageEvents(role?: UserRole | null): boolean {
  return role === 'admin'
}

export function canManageMembers(role?: UserRole | null): boolean {
  return role === 'admin'
}

export function canCollectPayments(role?: UserRole | null): boolean {
  return role === 'admin' || role === 'collector'
}

export function canViewReports(role?: UserRole | null): boolean {
  return role === 'admin' || role === 'collector'
}

export function canViewOwnPayments(role?: UserRole | null): boolean {
  return role === 'admin' || role === 'collector' || role === 'member'
}

// API 路由權限檢查中間件
export function withAuth(handler: (request: Request, context: { user: unknown }) => Promise<Response>) {
  return async (request: Request, context: { user?: unknown }) => {
    try {
      const user = await requireAuth()
      const newContext = { ...context, user }
      return await handler(request, newContext)
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : '認證失敗' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

export function withRole(requiredRoles: UserRole[]) {
  return function(handler: (request: Request, context: { user: unknown }) => Promise<Response>) {
    return async (request: Request, context: { user?: unknown }) => {
      try {
        const user = await requireRole(requiredRoles)
        const newContext = { ...context, user }
        return await handler(request, newContext)
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: error instanceof Error ? error.message : '權限不足' 
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
  }
}

export const withAdmin = withRole(['admin'])
export const withCollector = withRole(['admin', 'collector'])