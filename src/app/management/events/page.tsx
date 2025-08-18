'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card, { CardContent } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Event } from '@/types/database'

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'planning'>('all')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadEvents()
  }, [session, status, router])

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events')
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

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    return event.status === filter
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      planning: { text: '規劃中', class: 'bg-yellow-100 text-yellow-700' },
      active: { text: '進行中', class: 'bg-green-100 text-green-700' },
      completed: { text: '已完成', class: 'bg-blue-100 text-blue-700' },
      cancelled: { text: '已取消', class: 'bg-red-100 text-red-700' }
    }
    const badge = badges[status as keyof typeof badges] || badges.planning
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.class}`}>
        {badge.text}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  if (!session) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-50">
      <PageHeader
        title="活動管理"
        subtitle="管理所有收費活動"
        icon="🎯"
        gradient="management"
      >
        <Button href="/management/events/create">
          + 建立新活動
        </Button>
      </PageHeader>

      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* 篩選器 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: 'all', label: '全部' },
              { key: 'planning', label: '規劃中' },
              { key: 'active', label: '進行中' },
              { key: 'completed', label: '已完成' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                onClick={() => setFilter(key as 'all' | 'active' | 'completed' | 'planning')}
                variant={filter === key ? 'primary' : 'secondary'}
                size="sm"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* 活動列表 */}
          {filteredEvents.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl opacity-20 mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4">沒有找到活動</h3>
              <p className="text-slate-600 mb-6">
                {filter === 'all' ? '還沒有建立任何活動' : `沒有${filter === 'planning' ? '規劃中' : filter === 'active' ? '進行中' : '已完成'}的活動`}
              </p>
              <Button href="/management/events/create">
                建立第一個活動
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.eventID} hover>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{event.eventName}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <div className="space-y-1 text-slate-600">
                          <p>📅 {new Date(event.eventDate).toLocaleDateString('zh-TW')}</p>
                          <p>💰 NT$ {event.requiredAmount.toLocaleString()}</p>
                          <p>👥 {event.participantCount} 人參與</p>
                          {event.description && <p>📝 {event.description}</p>}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                          <span>收費進度: {event.collectionProgress?.toFixed(1) || 0}%</span>
                          <span>已收: NT$ {event.collectedAmount?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                        <Button
                          href={`/management/events/${event.eventID}`}
                          variant="secondary"
                          size="sm"
                        >
                          查看詳情
                        </Button>
                        {event.status === 'active' && (
                          <Button
                            href={`/collection/${event.eventID}`}
                            size="sm"
                          >
                            開始收費
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}