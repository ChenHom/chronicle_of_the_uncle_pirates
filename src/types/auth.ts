// 認證相關型別定義

export type UserRole = 'admin' | 'collector' | 'member'

export type Permission = 
  | 'create_event' 
  | 'manage_members' 
  | 'collect_payment' 
  | 'view_all'
  | 'view_events'
  | 'view_own_payments'

export interface LineProfile {
  sub: string          // LINE User ID
  name: string         // Display Name
  picture?: string     // Profile Picture URL
  email?: string       // Email (如果有提供)
}

export interface AuthorizedMember {
  id: number
  realName: string
  lineDisplayName?: string
  phone?: string
  role: UserRole
  department?: string
  authorizedBy: string
  authorizedDate: string
  status: 'active' | 'inactive'
  notes?: string
}

export interface RegisteredMember {
  memberID: number
  lineUserID: string
  lineDisplayName: string
  linePictureURL?: string
  realName: string
  role: UserRole
  registerDate: string
  lastLoginDate: string
  status: 'active' | 'inactive'
  matchedFromID: number
}

export interface PendingRegistration {
  requestID: number
  lineUserID: string
  lineDisplayName: string
  linePictureURL?: string
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewDate?: string
  selectedAuthorizedID?: number
  notes?: string
  possibleMatches?: AuthorizedMember[]
}

export interface UserSession {
  id: string
  name: string
  image?: string
  role: UserRole
  lineUserId: string
  realName: string
  permissions: Permission[]
}

// API 請求/回應型別
export interface ApprovalRequest {
  requestId: number
  selectedAuthorizedId: number
  action: 'approve' | 'reject'
  notes?: string
}

export interface ApprovalResponse {
  success: boolean
  message: string
  newMemberId?: number
}

export interface CreateMemberRequest {
  realName: string
  lineDisplayName?: string
  phone?: string
  role: UserRole
  department?: string
  notes?: string
}

export interface UpdateMemberRequest {
  realName?: string
  role?: UserRole
  status?: 'active' | 'inactive'
  notes?: string
}

// 權限檢查相關
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: ['create_event', 'manage_members', 'collect_payment', 'view_all'],
  collector: ['collect_payment', 'view_events'],
  member: ['view_own_payments', 'view_events']
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) || false
}

// 錯誤型別
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}