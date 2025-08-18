'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card, { CardContent, StatsCard } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { PaymentRecord } from '@/types/database'

export default function MyProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [myPayments, setMyPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadMyPayments()
  }, [session, status, router])

  const loadMyPayments = async () => {
    try {
      const response = await fetch('/api/my/payments')
      if (response.ok) {
        const data = await response.json()
        setMyPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Failed to load my payments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  if (!session) {
    return null
  }

  const totalRequired = myPayments.reduce((sum, p) => sum + p.requiredAmount, 0)
  const totalPaid = myPayments.reduce((sum, p) => sum + p.paidAmount, 0)
  const remaining = totalRequired - totalPaid
  const paidCount = myPayments.filter(p => p.paymentStatus === 'paid').length
  const unpaidCount = myPayments.filter(p => p.paymentStatus === 'unpaid').length
  const partialCount = myPayments.filter(p => p.paymentStatus === 'partial').length

  const getStatusBadge = (status: PaymentRecord['paymentStatus']) => {
    const badges = {
      unpaid: { text: '未繳費', class: 'bg-red-100 text-red-700' },
      partial: { text: '部分繳費', class: 'bg-yellow-100 text-yellow-700' },
      paid: { text: '已繳費', class: 'bg-green-100 text-green-700' }
    }
    const badge = badges[status]
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.class}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-100 to-purple-50">
      <PageHeader
        title="個人中心"
        subtitle={`歡迎，${session.user.name || '使用者'}`}
        icon="👤"
        gradient="personal"
      />

      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* 個人資訊 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">個人資訊</h2>
              <div className="flex items-center gap-6">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || '使用者'}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {session.user.name || '使用者'}
                  </h3>
                  <p className="text-slate-600">LINE 登入</p>
                  {session.user.lineUserId && (
                    <p className="text-sm text-slate-500">ID: {session.user.lineUserId}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 繳費統計 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="參與活動"
              value={myPayments.length.toString()}
              icon="🎯"
            />
            <StatsCard
              title="已繳費"
              value={paidCount.toString()}
              icon="✅"
              className="border-green-200"
            />
            <StatsCard
              title="待繳費"
              value={(unpaidCount + partialCount).toString()}
              icon="⏳"
              className={unpaidCount + partialCount > 0 ? 'border-yellow-200' : ''}
            />
            <StatsCard
              title="繳費率"
              value={`${myPayments.length > 0 ? ((paidCount / myPayments.length) * 100).toFixed(1) : 0}%`}
              icon="📊"
            />
          </div>

          {/* 金額統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="總應繳金額"
              value={`NT$ ${totalRequired.toLocaleString()}`}
              icon="💰"
            />
            <StatsCard
              title="已繳金額"
              value={`NT$ ${totalPaid.toLocaleString()}`}
              icon="✅"
              className="border-green-200"
            />
            <StatsCard
              title="待繳金額"
              value={`NT$ ${remaining.toLocaleString()}`}
              icon="⏳"
              className={remaining > 0 ? 'border-red-200' : 'border-green-200'}
            />
          </div>

          {/* 繳費記錄 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">我的繳費記錄</h2>
              
              {myPayments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl opacity-20 mb-6">📋</div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-4">暫無繳費記錄</h3>
                  <p className="text-slate-600">目前還沒有參與任何需要繳費的活動</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPayments
                    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                    .map((payment) => (
                      <div
                        key={payment.trackingID}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-50 rounded-lg"
                      >
                        {/* 活動資訊 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-slate-900">
                              活動 #{payment.eventID}
                            </h4>
                            {getStatusBadge(payment.paymentStatus)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                            <div>
                              <span className="font-medium">應繳: </span>
                              NT$ {payment.requiredAmount.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">已繳: </span>
                              <span className={
                                payment.paidAmount >= payment.requiredAmount 
                                  ? 'text-green-600' 
                                  : payment.paidAmount > 0 
                                    ? 'text-yellow-600' 
                                    : 'text-red-600'
                              }>
                                NT$ {payment.paidAmount.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">差額: </span>
                              <span className={
                                payment.requiredAmount - payment.paidAmount <= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }>
                                NT$ {(payment.requiredAmount - payment.paidAmount).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">建立: </span>
                              {new Date(payment.createdDate).toLocaleDateString('zh-TW')}
                            </div>
                          </div>

                          {payment.paymentDate && (
                            <div className="text-sm text-slate-600 mb-2">
                              <span className="font-medium">繳費日期: </span>
                              {new Date(payment.paymentDate).toLocaleDateString('zh-TW')}
                              {payment.paymentMethod && (
                                <>
                                  {' ・ '}
                                  <span className="font-medium">付款方式: </span>
                                  {payment.paymentMethod === 'cash' ? '現金' : 
                                   payment.paymentMethod === 'transfer' ? '轉帳' : '其他'}
                                </>
                              )}
                            </div>
                          )}

                          {payment.notes && (
                            <div className="text-sm text-slate-600">
                              <span className="font-medium">備註: </span>
                              {payment.notes}
                            </div>
                          )}
                        </div>

                        {/* 狀態指示 */}
                        <div className="flex items-center justify-center min-w-fit">
                          {payment.paymentStatus === 'paid' ? (
                            <div className="text-green-600 text-2xl">✅</div>
                          ) : payment.paymentStatus === 'partial' ? (
                            <div className="text-yellow-600 text-2xl">⏳</div>
                          ) : (
                            <div className="text-red-600 text-2xl">❌</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">繳費歷史</h3>
                <p className="text-slate-600 mb-4">查看完整的繳費記錄和統計</p>
                <Button href="/my/history" variant="secondary" className="w-full">
                  查看歷史
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">設定</h3>
                <p className="text-slate-600 mb-4">管理個人偏好和通知設定</p>
                <Button href="/my/settings" variant="secondary" className="w-full">
                  個人設定
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}