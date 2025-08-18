'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Card, { CardContent } from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { AuthorizedMember } from '@/types/auth'

interface EventFormData {
  eventName: string
  eventDate: string
  eventType: '比賽' | '聚餐' | '其他'
  requiredAmount: number
  description?: string
  participantLineUserIds: string[]
}

export default function CreateEventPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<AuthorizedMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EventFormData>({
    defaultValues: {
      eventDate: new Date().toISOString().split('T')[0],
      eventType: '聚餐',
      requiredAmount: 100,
      participantLineUserIds: []
    }
  })

  const participantIds = watch('participantLineUserIds')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadMembers()
  }, [session, status, router])

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members/authorized')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Failed to load members:', error)
      toast.error('載入成員清單失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleMemberToggle = (lineUserId: string) => {
    const currentIds = participantIds || []
    const newIds = currentIds.includes(lineUserId)
      ? currentIds.filter(id => id !== lineUserId)
      : [...currentIds, lineUserId]
    
    setValue('participantLineUserIds', newIds)
  }

  const selectAllMembers = () => {
    const allIds = members
      .filter(member => member.status === 'active')
      .map(member => member.id.toString())
    setValue('participantLineUserIds', allIds)
  }

  const clearAllMembers = () => {
    setValue('participantLineUserIds', [])
  }

  const onSubmit = async (data: EventFormData) => {
    if (data.participantLineUserIds.length === 0) {
      toast.error('請至少選擇一位參與成員')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('活動建立成功！')
        router.push(`/management/events/${result.eventID}`)
      } else {
        const error = await response.json()
        toast.error(error.message || '建立活動失敗')
      }
    } catch (error) {
      console.error('Failed to create event:', error)
      toast.error('建立活動失敗')
    } finally {
      setSubmitting(false)
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
        title="建立新活動"
        subtitle="設定活動資訊並選擇參與成員"
        icon="🎯"
        gradient="management"
      >
        <Button href="/management/events" variant="secondary">
          ← 返回活動列表
        </Button>
      </PageHeader>

      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 基本資訊 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">活動基本資訊</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      活動名稱 *
                    </label>
                    <input
                      type="text"
                      {...register('eventName', { required: '請輸入活動名稱' })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例：12月聚餐"
                    />
                    {errors.eventName && (
                      <p className="text-red-600 text-sm mt-1">{errors.eventName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      活動日期 *
                    </label>
                    <input
                      type="date"
                      {...register('eventDate', { required: '請選擇活動日期' })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.eventDate && (
                      <p className="text-red-600 text-sm mt-1">{errors.eventDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      活動類型 *
                    </label>
                    <select
                      {...register('eventType', { required: '請選擇活動類型' })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="聚餐">聚餐</option>
                      <option value="比賽">比賽</option>
                      <option value="其他">其他</option>
                    </select>
                    {errors.eventType && (
                      <p className="text-red-600 text-sm mt-1">{errors.eventType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      收費金額 (NT$) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      {...register('requiredAmount', { 
                        required: '請輸入收費金額',
                        min: { value: 0, message: '金額不能為負數' }
                      })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                    {errors.requiredAmount && (
                      <p className="text-red-600 text-sm mt-1">{errors.requiredAmount.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    活動說明 (選填)
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="活動詳細說明..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 參與成員選擇 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">選擇參與成員</h2>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={selectAllMembers}
                      variant="secondary"
                      size="sm"
                    >
                      全選
                    </Button>
                    <Button
                      type="button"
                      onClick={clearAllMembers}
                      variant="secondary"
                      size="sm"
                    >
                      清除
                    </Button>
                  </div>
                </div>

                <p className="text-slate-600 mb-4">
                  已選擇 {participantIds?.length || 0} 位成員
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {members
                    .filter(member => member.status === 'active')
                    .map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleMemberToggle(member.id.toString())}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          participantIds?.includes(member.id.toString())
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900">{member.realName}</h4>
                            <p className="text-sm text-slate-600">{member.role}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={participantIds?.includes(member.id.toString()) || false}
                            readOnly
                            className="text-blue-600"
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {members.filter(member => member.status === 'active').length === 0 && (
                  <p className="text-center text-slate-600 py-8">
                    沒有可用的成員。請先到成員管理頁面新增成員。
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4">
              <Button
                href="/management/events"
                variant="secondary"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? '建立中...' : '建立活動'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}