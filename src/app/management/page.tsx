'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Card, { CardContent, StatsCard } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalMembers: number
  pendingRegistrations: number
  totalAmount: number
  collectionRate: number
}

export default function ManagementDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // 載入統計資料
    loadDashboardStats()
  }, [session, status, router])

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/management/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
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

  return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-50">
      <PageHeader
        title="管理中心"
        subtitle={`歡迎回來，${session.user.name || '管理員'}`}
        icon="⚙️"
        gradient="management"
      />

      <section className="container mx-auto px-6 py-16">
        {/* 統計資料 */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">系統概覽</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatsCard
              title="總活動數"
              value={stats?.totalEvents.toString() || '0'}
              icon="🎯"
            />
            <StatsCard
              title="進行中活動"
              value={stats?.activeEvents.toString() || '0'}
              icon="⚡"
            />
            <StatsCard
              title="註冊成員"
              value={stats?.totalMembers.toString() || '0'}
              icon="👥"
            />
            <StatsCard
              title="待審核申請"
              value={stats?.pendingRegistrations.toString() || '0'}
              icon="⏳"
              className={stats?.pendingRegistrations ? 'border-yellow-200' : ''}
            />
            <StatsCard
              title="總收費金額"
              value={`NT$ ${stats?.totalAmount?.toLocaleString() || '0'}`}
              icon="💰"
            />
            <StatsCard
              title="收費完成率"
              value={`${stats?.collectionRate?.toFixed(1) || '0'}%`}
              icon="📊"
            />
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">建立新活動</h3>
                <p className="text-slate-600 mb-4">建立新的收費活動並設定參與成員</p>
                <Button href="/management/events/create" className="w-full">
                  開始建立
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">成員管理</h3>
                <p className="text-slate-600 mb-4">管理授權成員和審核註冊申請</p>
                <Button href="/management/members" variant="secondary" className="w-full">
                  管理成員
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">收費管理</h3>
                <p className="text-slate-600 mb-4">查看和管理進行中的收費活動</p>
                <Button href="/collection" variant="secondary" className="w-full">
                  收費管理
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">活動報表</h3>
                <p className="text-slate-600 mb-4">查看活動統計和收費報表</p>
                <Button href="/management/reports" variant="secondary" className="w-full">
                  查看報表
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">系統設定</h3>
                <p className="text-slate-600 mb-4">管理系統設定和權限配置</p>
                <Button href="/management/settings" variant="secondary" className="w-full">
                  系統設定
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">個人資料</h3>
                <p className="text-slate-600 mb-4">查看和編輯個人資料設定</p>
                <Button href="/my/profile" variant="secondary" className="w-full">
                  個人資料
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 最近活動 */}
        {stats && stats.activeEvents > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">最近活動</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-slate-600">
                  目前有 {stats.activeEvents} 個活動進行中
                </p>
                <div className="text-center mt-4">
                  <Button href="/management/events">查看所有活動</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}