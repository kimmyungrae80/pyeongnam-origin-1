'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CharacterMascot } from '@/components/Character'
import { createClient } from '@/lib/supabase/client'
import { PYEONGNAM_REGIONS, TRACK_EMOJIS } from '@/lib/types'
import type { Track } from '@/lib/types'

type Generation = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    generation: '' as Generation | '',
    origin_region: '',
    track: '' as Track | '',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, generation, origin_region, track, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        setError('회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      if (profile?.onboarding_completed) {
        router.replace('/dashboard')
        return
      }

      setUser(user)
      setForm({
        name: profile?.name ?? user.user_metadata.name ?? '',
        generation: (profile?.generation as Generation | null) ?? '',
        origin_region: profile?.origin_region ?? '',
        track: (profile?.track as Track | null) ?? '',
      })
    }
    getUser()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value === '' ? '' : (name === 'generation' ? Number(value) : value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.name || !form.generation || !form.origin_region || !form.track) {
      setError('모든 정보를 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      if (!user) {
        setError('로그인이 필요합니다.')
        router.push('/auth')
        return
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          generation: Number(form.generation),
          origin_region: form.origin_region,
          track: form.track,
          onboarding_completed: true,
        })
        .eq('id', user.id)
        .select('id, onboarding_completed')
        .single()

      if (updateError) throw updateError
      if (!updatedProfile.onboarding_completed) throw new Error('온보딩 완료 상태를 저장하지 못했습니다.')

      // 대시보드로 이동
      router.replace('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 마스코트 */}
          <div className="text-center mb-6">
            <CharacterMascot className="w-20 h-20 mx-auto" />
          </div>

          {/* 진행 표시 */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">온보딩</h1>
              <p className="text-sm text-gray-500">{step}/4단계</p>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Step 1: 이름 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">👤 이름을 알려주세요</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    플랫폼에서 사용할 이름입니다. 언제든 변경할 수 있습니다.
                  </p>
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="input-base text-lg py-3"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: 세대 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">👨‍👩‍👧‍👦 몇 세대인가요?</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    평안남도 연계 세대를 선택해주세요.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 1, label: '1세대', desc: '할아버지/할머니' },
                    { value: 2, label: '2세대', desc: '부모님' },
                    { value: 3, label: '3세대', desc: '자녀' },
                    { value: 4, label: '4세대', desc: '손자손녀' },
                  ].map((gen) => (
                    <button
                      key={gen.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, generation: gen.value as Generation }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        form.generation === gen.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{gen.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{gen.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: 출신지 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">🗺️ 평남의 어느 지역 출신인가요?</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    할아버지/할머니가 사시던 지역을 선택해주세요. (대략적인 선택 가능)
                  </p>
                </div>
                <select
                  name="origin_region"
                  value={form.origin_region}
                  onChange={handleChange}
                  className="input-base text-lg py-3"
                >
                  <option value="">지역을 선택하세요</option>
                  {PYEONGNAM_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 4: 관심 트랙 */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">🎯 어떤 방식으로 참여하고 싶나요?</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    나중에 변경할 수 있습니다. 여러 트랙에 참여도 가능합니다.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: 'storytelling' as Track,
                      label: '스토리텔링',
                      desc: '가족 역사, 인터뷰, 에세이',
                    },
                    {
                      value: 'lifestyle' as Track,
                      label: '라이프스타일',
                      desc: '음식, 복식, 생활 문화',
                    },
                    {
                      value: 'digital' as Track,
                      label: '디지털/아트',
                      desc: '지도, 영상, 디지털 아트',
                    },
                    {
                      value: 'free' as Track,
                      label: '자유주제',
                      desc: '숏폼, 웹툰, 팝아트',
                    },
                  ].map((track) => (
                    <button
                      key={track.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, track: track.value }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        form.track === track.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{TRACK_EMOJIS[track.value]}</span>
                        <div className="font-bold text-gray-900">{track.label}</div>
                      </div>
                      <div className="text-xs text-gray-500">{track.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-all"
                >
                  ← 이전
                </button>
              )}
              {step < 4 && (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !form.name) ||
                    (step === 2 && !form.generation) ||
                    (step === 3 && !form.origin_region)
                  }
                  className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all disabled:bg-gray-300"
                >
                  다음 →
                </button>
              )}
              {step === 4 && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all disabled:bg-gray-300"
                >
                  {loading ? '저장 중...' : '시작하기 🚀'}
                </button>
              )}
            </div>
          </form>

          {/* 팁 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              이 정보는 <Link href="/profile" className="text-purple-600 font-medium hover:underline">프로필 설정</Link>에서 언제든 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
