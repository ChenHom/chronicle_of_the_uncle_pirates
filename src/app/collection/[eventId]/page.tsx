'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Card, { CardContent } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { PaymentRecord, Event, PaymentSummary } from '@/types/database'

export default function CollectionDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadEventData = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/payments`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.eventInfo)
        setPayments(data.payments || [])
        setSummary(data.summary)
      } else {
        toast.error('載入活動資料失敗')
        router.push('/collection')
      }
    } catch (error) {
      console.error('Failed to load event data:', error)
      toast.error('載入活動資料失敗')
      router.push('/collection')
    } finally {
      setLoading(false)
    }
  }, [eventId, router])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadEventData()
  }, [session, status, router, eventId, loadEventData])

  const updatePayment = async (trackingID: string, paidAmount: number, paymentMethod: string, notes?: string) => {
    setUpdating(trackingID)
    try {
      const response = await fetch(`/api/payments/${trackingID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paidAmount,
          paymentMethod,
          notes,
          paymentDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      })

      if (response.ok) {
        toast.success('收費記錄更新成功')
        await loadEventData() // 重新載入資料
      } else {
        const error = await response.json()
        toast.error(error.message || '更新失敗')
      }
    } catch (error) {
      console.error('Failed to update payment:', error)
      toast.error('更新失敗')
    } finally {
      setUpdating(null)
    }
  }

  const markAsPaid = (record: PaymentRecord) => {
    updatePayment(record.trackingID, record.requiredAmount, 'cash')
  }

  const markAsPartial = (record: PaymentRecord, amount: number) => {
    updatePayment(record.trackingID, amount, 'cash')
  }

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

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  if (!session || !event) {
    return null
  }

  const unpaidCount = payments.filter(p => p.paymentStatus === 'unpaid').length
  const partialCount = payments.filter(p => p.paymentStatus === 'partial').length
  const paidCount = payments.filter(p => p.paymentStatus === 'paid').length

  return (
    <div className="bg-gradient-to-br from-green-100 to-green-50">
      <PageHeader
        title={event.eventName}
        subtitle="收費操作"
        icon="💳"
        gradient="collection"
      >
        <Button href="/collection" variant="secondary">
          ← 返回收費列表
        </Button>
      </PageHeader>

      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* 活動資訊 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">活動資訊</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {event.participantCount}
                  </div>
                  <div className="text-sm text-slate-600">總參與人數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    NT$ {event.requiredAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">每人收費</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    NT$ {(event.requiredAmount * event.participantCount).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">總收費金額</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {event.collectionProgress?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-slate-600">收費完成率</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 收費統計 */}
          {summary && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">收費統計</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
                    <div className="text-sm text-slate-600">未繳費</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
                    <div className="text-sm text-slate-600">部分繳費</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                    <div className="text-sm text-slate-600">已繳費</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      NT$ {summary.totalCollected.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">已收金額</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      NT$ {(summary.totalRequired - summary.totalCollected).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">待收金額</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {summary.collectionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600">收費率</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 成員收費清單 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">成員收費清單</h2>
              
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.trackingID}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-50 rounded-lg"
                  >
                    {/* 成員資訊 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-slate-900">
                          {payment.memberDisplayName}
                        </h4>
                        {getStatusBadge(payment.paymentStatus)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
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
                        {payment.paymentDate && (
                          <div>
                            <span className="font-medium">繳費日: </span>
                            {new Date(payment.paymentDate).toLocaleDateString('zh-TW')}
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">備註: </span>
                          {payment.notes}
                        </div>
                      )}
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex flex-wrap gap-2 min-w-fit">
                      {payment.paymentStatus !== 'paid' && (
                        <>
                          <Button
                            onClick={() => markAsPaid(payment)}
                            disabled={updating === payment.trackingID}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updating === payment.trackingID ? '更新中...' : '標記已付'}
                          </Button>
                          <Button
                            onClick={() => {
                              const amount = prompt('請輸入已繳金額:', payment.paidAmount.toString())
                              if (amount && !isNaN(Number(amount))) {
                                markAsPartial(payment, Number(amount))
                              }
                            }}
                            disabled={updating === payment.trackingID}
                            size="sm"
                            variant="secondary"
                          >
                            部分收費
                          </Button>
                        </>
                      )}
                      {payment.paymentStatus === 'paid' && (
                        <span className="text-green-600 text-sm font-medium py-2 px-3">
                          ✓ 已完成
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {payments.length === 0 && (
                <div className="text-center py-8 text-slate-600">
                  尚無收費記錄
                </div>
              )}
            </CardContent>
          </Card>

          {/* 批次操作 */}
          {unpaidCount > 0 && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">批次操作</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => {
                      if (confirm(`確定要將所有未繳費成員標記為已繳費嗎？這會影響 ${unpaidCount} 筆記錄。`)) {
                        // 實作批次標記邏輯
                        toast.success('批次操作功能開發中')
                      }
                    }}
                    variant="secondary"
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    全部標記為已繳費
                  </Button>
                  <Button
                    href={`/collection/${eventId}/report`}
                    variant="secondary"
                  >
                    產生收費報表
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}