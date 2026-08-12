'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Mission, Submission } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // 프로필 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (!profileData) {
        router.push('/onboarding')
        return
      }

      if (!profileData.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      setProfile(profileData as Profile)

      // 미션 가져오기
      const { data: missionsData } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('order_num')

      setMissions((missionsData as Mission[]) || [])

      // 제출물 가져오기
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setSubmissions((submissionsData as Submission[]) || [])

      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </main>
      </>
    )
  }

  if (!profile) {
    return null
  }

  const approvedSubmissions = submissions.filter(s => s.status === 'approved')
  const pendingSubmissions = submissions.filter(s => s.status === 'submitted')

  const stats = {
    completedMissions: approvedSubmissions.length,
    totalPoints: profile.points || 0,
    pendingReview: pendingSubmissions.length,
  }

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        {/* 히어로 섹션 */}
        {profile && (
          <div className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{profile.name}님, 환영합니다! 👋</h1>
                  <p className="text-purple-100">평남의 뿌리를 함께 찾아보고 있군요.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">⭐ {stats.totalPoints}</div>
                  <div className="text-sm text-purple-100">포인트</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.completedMissions}</div>
              <div className="text-sm text-gray-500">완료된 미션</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.pendingReview}</div>
              <div className="text-sm text-gray-500">심사 대기 중</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-teal-600 mb-1">{missions.length}</div>
              <div className="text-sm text-gray-500">이용 가능한 미션</div>
            </div>
          </div>

          {/* AI 도구 */}
          <section className="mb-8" aria-labelledby="ai-tools-title">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 id="ai-tools-title" className="section-title">✨ AI로 더 쉽게 기록하기</h2>
                <p className="text-sm text-gray-500 mt-1">질문 만들기부터 이야기 정리까지 도와드립니다.</p>
              </div>
              <Link href="/ai-tools" className="text-sm font-medium text-purple-700 hover:text-purple-900 whitespace-nowrap">
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/interview-helper" className="card border-purple-200 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">🎤</div>
                <h3 className="font-bold text-gray-900">AI 인터뷰 질문</h3>
                <p className="text-sm text-gray-500 mt-1">가족에게 여쭤볼 질문을 만들어보세요.</p>
              </Link>
              <Link href="/story-generator" className="card border-pink-200 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">📖</div>
                <h3 className="font-bold text-gray-900">AI 이야기 초안</h3>
                <p className="text-sm text-gray-500 mt-1">인터뷰 기록을 가족 이야기로 정리하세요.</p>
              </Link>
              <Link href="/term-explainer" className="card border-amber-200 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="font-bold text-gray-900">AI 평남 용어 설명</h3>
                <p className="text-sm text-gray-500 mt-1">어려운 역사·문화 용어를 쉽게 알아보세요.</p>
              </Link>
            </div>
          </section>

          {/* 주요 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* 추천 미션 */}
            <div className="lg:col-span-2">
              <h2 className="section-title mb-4">🎯 추천 미션</h2>
              {missions.length > 0 ? (
                <div className="space-y-3">
                  {missions.slice(0, 3).map((mission) => {
                    const isCompleted = approvedSubmissions.some(s => s.mission_id === mission.id)
                    return (
                      <Link
                        key={mission.id}
                        href={`/submit?mission=${mission.id}`}
                        className="card hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                              isCompleted
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {isCompleted ? '✅ 완료됨' : `⭐ +${mission.points}p`}
                            </div>
                            <h3 className="font-bold text-gray-900">{mission.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{mission.description}</p>
                          </div>
                          <div className="text-2xl">→</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="card text-center text-gray-500">
                  <p>이용 가능한 미션이 없습니다.</p>
                </div>
              )}
            </div>

            {/* 최근 제출물 */}
            <div>
              <h2 className="section-title mb-4">📤 최근 제출물</h2>
              {submissions.length > 0 ? (
                <div className="space-y-2">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="card bg-gray-50 p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {submission.title}
                          </p>
                          <div className={`text-xs mt-1 ${
                            submission.status === 'approved' ? 'text-green-600' :
                            submission.status === 'submitted' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {submission.status === 'approved' ? '✅ 승인됨' :
                             submission.status === 'submitted' ? '⏳ 심사 중' :
                             '❌ 반려됨'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center text-gray-500 text-sm">
                  <p>제출물이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="card bg-gradient-to-r from-purple-50 to-teal-50 border-purple-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">다음 미션에 도전해보세요!</h3>
                <p className="text-sm text-gray-500">새로운 제출물이 아카이브에 공개될 수 있습니다.</p>
              </div>
              <Link href="/missions" className="btn-primary whitespace-nowrap">
                미션 보기 →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
