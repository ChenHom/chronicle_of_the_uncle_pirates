'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardContent } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 檢查是否已登入
    getSession().then((session) => {
      if (session) {
        router.push('/management')
      }
    })
  }, [router])

  const handleLineLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('line', { 
        callbackUrl: '/management',
        redirect: false 
      })
    } catch (error) {
      console.error('登入失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50">
      <PageHeader
        title="系統登入"
        subtitle="海盜大叔收費管理系統"
        icon="🔐"
        gradient="management"
      />
      
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-6">🏴‍☠️</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                歡迎回到海盜大叔
              </h2>
              <p className="text-slate-600 mb-8">
                請使用 LINE 帳號登入系統
              </p>
              
              <Button
                onClick={handleLineLogin}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
              >
                {isLoading ? '登入中...' : '使用 LINE 登入'}
              </Button>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  只有授權成員可以登入系統<br />
                  如需申請權限，請聯絡管理員
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}