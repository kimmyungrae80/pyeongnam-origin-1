'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StorageMonitor from '@/components/StorageMonitor'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </main>
      </>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-red-600 text-white px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">⚙️ 관리자 콘솔</h1>
            <p className="text-purple-100">제출물을 심사하고 포인트를 지급합니다</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 저장소 모니터 */}
          <div className="mb-8">
            <StorageMonitor />
          </div>

          {/* 안내 메시지 */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-2">📋 기능 준비 중</h3>
            <p className="text-sm text-gray-700">
              관리자 심사 시스템은 준비 중입니다.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              현재 저장소 모니터링 기능만 활성화되어 있습니다.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
