'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { TRACK_EMOJIS, TRACK_LABELS } from '@/lib/types'
import type { Profile, Track } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    bio: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data as Profile)
        setForm({
          name: data.name || '',
          bio: data.bio || '',
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('로그인이 필요합니다.')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          bio: form.bio,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, name: form.name, bio: form.bio } : null)
      setEditing(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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

  if (!profile) {
    return null
  }

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="section-title mb-8">👤 프로필 설정</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* 프로필 카드 */}
          <div className="card mb-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-4xl">
                {(profile.name || '회').charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.name || '회원'}
                </h2>
                <p className="text-gray-500">평남 오리진 참여자</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {profile.generation}세대
                  </span>
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                    {profile.origin_region || '미설정'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-600">{profile.points || 0}</div>
                <div className="text-sm text-gray-500">포인트</div>
              </div>
            </div>

            {!editing && (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-700 mb-4">{profile.bio || '자기소개가 없습니다.'}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary px-6 py-2"
                >
                  수정하기
                </button>
              </div>
            )}

            {editing && (
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div>
                  <label className="label-base font-medium mb-2">이름</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base font-medium mb-2">자기소개</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="자신에 대해 소개해주세요"
                    className="input-base resize-none"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2"
                  >
                    {saving ? '저장 중...' : '저장하기'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 btn-outline py-2"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-3xl mb-2">📤</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-xs text-gray-500">제출물</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-xs text-gray-500">승인됨</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-xs text-gray-500">배지</div>
            </div>
          </div>

          {/* 참여 정보 */}
          <div className="card mb-6">
            <h3 className="font-bold text-gray-900 mb-4">참여 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">세대</span>
                <span className="font-medium text-gray-900">{profile.generation}세대</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-600">출신지</span>
                <span className="font-medium text-gray-900">{profile.origin_region || '-'}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-600">관심 트랙</span>
                <span className="font-medium text-gray-900">
                  {profile.track ? (
                    <>
                      {TRACK_EMOJIS[profile.track as Track]} {TRACK_LABELS[profile.track as Track]}
                    </>
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-600">가입일</span>
                <span className="font-medium text-gray-900">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('ko-KR')
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 기타 */}
          <div className="space-y-2">
            <Link href="/dashboard" className="card hover:shadow-md transition-all py-3 text-center text-gray-900 font-medium">
              ← 대시보드로 돌아가기
            </Link>
            <button
              onClick={handleLogout}
              className="w-full card hover:shadow-md transition-all py-3 text-center text-red-600 font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
