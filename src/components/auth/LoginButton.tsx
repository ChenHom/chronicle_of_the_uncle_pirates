'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Button from '@/components/Button'

export default function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Button disabled variant="secondary">
        載入中...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || '使用者'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-slate-700">
            {session.user.name || '使用者'}
          </span>
        </div>
        <Button
          onClick={() => signOut()}
          variant="secondary"
          size="sm"
        >
          登出
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => signIn('line')}
      variant="primary"
      className="bg-green-500 hover:bg-green-600"
    >
      LINE 登入
    </Button>
  )
}