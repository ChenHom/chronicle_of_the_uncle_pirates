'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card, { CardContent } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Event } from '@/types/database'

export default function CollectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadActiveEvents()
  }, [session, status, router])

  const loadActiveEvents = async () => {
    try {
      const response = await fetch('/api/events?status=active')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBg = (progress: number) => {
    if (progress >= 80) return 'bg-green-100'
    if (progress >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  if (!session) {
    return null
  }

  const activeEvents = events.filter(event => event.status === 'active')

  return (
    <div className="bg-gradient-to-br from-green-100 to-green-50">
      <PageHeader
        title="收費管理"
        subtitle="管理進行中的活動收費"
        icon="💳"
        gradient="collection"
      />

      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {activeEvents.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl opacity-20 mb-6">💳</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4">目前沒有需要收費的活動</h3>
              <p className="text-slate-600 mb-6">
                所有活動都已完成收費，或沒有進行中的活動
              </p>
              <Button href="/management/events">
                查看所有活動
              </Button>
            </Card>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  進行中的活動 ({activeEvents.length})
                </h2>
                <p className="text-slate-600">
                  點選活動開始收費操作
                </p>
              </div>

              <div className="space-y-6">
                {activeEvents.map((event) => {
                  const progress = event.collectionProgress || 0
                  const totalRequired = event.requiredAmount * event.participantCount
                  const remaining = totalRequired - (event.collectedAmount || 0)
                  
                  return (
                    <Card key={event.eventID} hover>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          {/* 活動資訊 */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                  {event.eventName}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <span>📅</span>
                                    <span>{new Date(event.eventDate).toLocaleDateString('zh-TW')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>👥</span>
                                    <span>{event.participantCount} 人參與</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>💰</span>
                                    <span>NT$ {event.requiredAmount.toLocaleString()} / 人</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>🎯</span>
                                    <span>總需收取: NT$ {totalRequired.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 收費進度 */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">收費進度</span>
                                <span className={`text-sm font-bold ${getProgressColor(progress)}`}>
                                  {progress.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full ${
                                    progress >= 80 ? 'bg-green-500' : 
                                    progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* 金額統計 */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                              <div className={`p-3 rounded-lg ${getProgressBg(progress)}`}>
                                <div className="text-sm text-slate-600">已收金額</div>
                                <div className={`text-lg font-bold ${getProgressColor(progress)}`}>
                                  NT$ {(event.collectedAmount || 0).toLocaleString()}
                                </div>
                              </div>
                              <div className="p-3 rounded-lg bg-slate-100">
                                <div className="text-sm text-slate-600">尚需收取</div>
                                <div className="text-lg font-bold text-slate-800">
                                  NT$ {remaining.toLocaleString()}
                                </div>
                              </div>
                              <div className="p-3 rounded-lg bg-blue-100 md:block hidden">
                                <div className="text-sm text-slate-600">收費率</div>
                                <div className="text-lg font-bold text-blue-600">
                                  {event.participantCount > 0 
                                    ? Math.round((progress / 100) * event.participantCount)
                                    : 0
                                  } / {event.participantCount}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 操作按鈕 */}
                          <div className="flex flex-col gap-3 min-w-fit">
                            <Button
                              href={`/collection/${event.eventID}`}
                              className="w-full lg:w-auto whitespace-nowrap"
                            >
                              開始收費
                            </Button>
                            <Button
                              href={`/management/events/${event.eventID}`}
                              variant="secondary"
                              className="w-full lg:w-auto whitespace-nowrap"
                            >
                              查看詳情
                            </Button>
                            {progress >= 100 && (
                              <Button
                                href={`/collection/${event.eventID}/complete`}
                                variant="secondary"
                                className="w-full lg:w-auto whitespace-nowrap bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                完成收費
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* 快速統計 */}
              <div className="mt-12 p-6 bg-white/50 rounded-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-4">收費統計</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {activeEvents.length}
                    </div>
                    <div className="text-sm text-slate-600">進行中活動</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {activeEvents.filter(e => (e.collectionProgress || 0) >= 100).length}
                    </div>
                    <div className="text-sm text-slate-600">完成收費</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {activeEvents.filter(e => (e.collectionProgress || 0) >= 50 && (e.collectionProgress || 0) < 100).length}
                    </div>
                    <div className="text-sm text-slate-600">收費中</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {activeEvents.filter(e => (e.collectionProgress || 0) < 50).length}
                    </div>
                    <div className="text-sm text-slate-600">剛開始</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}