'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Card, { CardContent } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return '系統設定錯誤，請聯絡管理員'
      case 'AccessDenied':
        return '存取被拒絕，您可能沒有權限登入'
      case 'Verification':
        return '驗證失敗，請重新嘗試'
      default:
        return '登入時發生未知錯誤'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-50">
      <PageHeader
        title="登入失敗"
        subtitle="發生錯誤"
        icon="❌"
        gradient="finances"
      />
      
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-6">😞</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                登入失敗
              </h2>
              <p className="text-slate-600 mb-8">
                {getErrorMessage(error)}
              </p>
              
              <div className="space-y-4">
                <Button
                  href="/auth/signin"
                  className="w-full"
                >
                  重新登入
                </Button>
                
                <Button
                  href="/"
                  variant="secondary"
                  className="w-full"
                >
                  返回首頁
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  如果問題持續發生，請聯絡管理員
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <ErrorContent />
    </Suspense>
  )
}