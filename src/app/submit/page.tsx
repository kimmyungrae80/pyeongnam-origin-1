'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import FileUploadSection from '@/components/FileUploadSection'
import { createClient } from '@/lib/supabase/client'
import { TRACK_EMOJIS, TRACK_LABELS, type Mission, type ContentType, type Track } from '@/lib/types'

// 미션별 가이드
const MISSION_GUIDES: Record<string, string[]> = {
  '가족사진 5장 업로드': [
    '📷 Step 1: 할아버지/할머니 사진 5장 찾기',
    '📝 Step 2: 각 사진이 언제, 어디서 촬영된 것인지 메모하기',
    '📤 Step 3: 아래에서 사진 5장 업로드',
    '✅ Step 4: 제목과 간단한 설명 입력 후 제출',
  ],
  '할아버지/할머니 인터뷰 1분 영상': [
    '🎥 Step 1: "할아버지가 살던 평양시는 어떤 곳이었나요?" 같은 질문 선택',
    '🎤 Step 2: 스마트폰으로 자연스럽게 대화 촬영 (1분 정도)',
    '📤 Step 3: 영상 업로드 또는 YouTube 링크 공유',
    '✅ Step 4: 제출하면 심사 후 아카이브에 공개됩니다',
  ],
  '평남 음식 레시피 영상': [
    '🍜 Step 1: 평양냉면, 어복쟁반 같은 평남 음식 준비',
    '🎥 Step 2: 만드는 과정을 영상으로 촬영',
    '🍽️ Step 3: 완성된 음식 사진 또는 짧은 설명 추가',
    '📤 Step 4: 영상 업로드 후 제출',
  ],
}

// 미션별 허용된 콘텐츠 타입
const MISSION_CONTENT_TYPES: Record<string, ContentType[]> = {
  '가족사진 5장 업로드': ['photo'],
  '할아버지/할머니 인터뷰 1분 영상': ['video'],
  '가문의 고향 이야기 에세이': ['essay'],
  '우리 집 평남 음식 레시피 영상': ['video'],
  '평남 전통 문양으로 굿즈 디자인': ['design'],
  '디지털 평남 지도 핀 등록': ['map'],
  '가상 고향 브이로그 제작': ['video'],
  '3세대 + 1세대 공동 인터뷰': ['video'],
  '평남 관련 숏폼 영상 제작': ['video'],
  '우리 가문 족보 탐색기': ['design', 'other'],
}

function MissionGuide({ missionTitle }: { missionTitle?: string }) {
  if (!missionTitle || !MISSION_GUIDES[missionTitle]) {
    return null
  }

  const steps = MISSION_GUIDES[missionTitle]

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">💡</span>
        이렇게 진행하세요
      </h3>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold">
              {i + 1}
            </div>
            <p className="text-gray-700 pt-0.5">{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white rounded border border-blue-100">
        <p className="text-xs text-gray-600">
          <strong>⭐ 팁:</strong> 자연스럽고 진심 어린 내용이 심사를 통과할 확률이 높습니다.
          멋있게 편집하지 않아도 괜찮습니다.
        </p>
      </div>
    </div>
  )
}

function SubmitForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    filename: string
  } | null>(null)

  const [form, setForm] = useState({
    title: '',
    content: '',
    content_type: 'photo' as ContentType,
    videoUrl: '',
  })

  useEffect(() => {
    const missionId = searchParams.get('mission')
    if (missionId) {
      supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single()
        .then(({ data }: { data: Mission | null }) => {
          if (data) {
            setMission(data)
            setForm(f => ({ ...f, title: data.title }))
          }
        })
    }
  }, [searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // 파일 URL 결정
      let fileUrls: string[] = []
      if (form.content_type === 'video' && form.videoUrl) {
        fileUrls = [form.videoUrl]
      } else if (uploadedFile) {
        fileUrls = [uploadedFile.url]
      }

      const { error: submitError } = await supabase.from('submissions').insert({
        user_id: user.id,
        mission_id: mission?.id ?? null,
        title: form.title,
        content: form.content,
        file_urls: fileUrls.length > 0 ? fileUrls : null,
        content_type: form.content_type,
        status: 'submitted',
      })

      if (submitError) throw submitError

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.')
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !!form.title && !loading && (
    form.content_type === 'video' ? !!form.videoUrl.trim() : !!uploadedFile
  )

  if (success) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="card max-w-md w-full text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">제출 완료!</h2>
            <p className="text-gray-500 mb-6">
              심사 후 포인트가 지급됩니다.<br />
              <strong>보통 1~3일 내로 결과를 알려드립니다.</strong>
            </p>
            <div className="flex gap-3">
              <Link href="/missions" className="flex-1 btn-outline py-3 text-center text-sm">
                미션 더 하기
              </Link>
              <Link href="/dashboard" className="flex-1 btn-primary py-3 text-center text-sm">
                대시보드 →
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* 미션 정보 */}
          {mission && (
            <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{TRACK_EMOJIS[mission.track as Track]}</span>
                <span className="badge badge-info">{TRACK_LABELS[mission.track as Track]}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{mission.title}</h2>
              <p className="text-sm text-gray-600 mt-2">{mission.description}</p>
              <div className="text-purple-700 font-bold text-base mt-3">
                완료 시 +{mission.points}p 획득
                {mission.is_family_mission && ` (가족 함께: ×${mission.family_bonus_multiplier})`}
              </div>
            </div>
          )}

          {/* 미션 가이드 */}
          <MissionGuide missionTitle={mission?.title} />

          <div className="card">
            <h1 className="font-bold text-gray-900 mb-6 text-xl">
              {mission ? '미션 결과 제출' : '콘텐츠 업로드'}
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">
                <p className="font-medium">⚠️ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 콘텐츠 유형 */}
              {mission && (
                <div>
                  <label className="label-base font-bold mb-2">
                    콘텐츠 유형
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    💡 이 미션에 필요한 형식입니다
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'photo', label: '📸 사진' },
                      { value: 'video', label: '🎬 영상' },
                      { value: 'essay', label: '📝 에세이' },
                      { value: 'design', label: '🎨 디자인' },
                      { value: 'map', label: '🗺 지도' },
                      { value: 'other', label: '기타' },
                    ]
                      .filter(({ value }) =>
                        MISSION_CONTENT_TYPES[mission.title]?.includes(value as ContentType) ?? false
                      )
                      .map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, content_type: value as ContentType })
                            setError('')
                          }}
                          className={`py-3 rounded-lg font-medium text-sm border-2 transition-all ${
                            form.content_type === value
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* 제목 */}
              <div>
                <label className="label-base font-bold mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="작품 제목을 입력하세요"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* 파일 업로드 또는 영상 URL */}
              {form.content_type === 'video' ? (
                <div>
                  <label className="label-base font-bold mb-2">
                    영상 링크 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    className="input-base"
                    placeholder="YouTube, Instagram, TikTok 링크를 입력하세요"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 YouTube, Instagram, TikTok에 먼저 업로드한 후 링크를 여기에 붙여넣으세요.
                  </p>
                </div>
              ) : (
                <FileUploadSection
                  onFileSelect={(file) => setUploadedFile(file)}
                />
              )}

              {/* 설명 */}
              <div>
                <label className="label-base font-bold mb-2">
                  설명 (선택)
                </label>
                <textarea
                  className="input-base resize-none"
                  rows={4}
                  placeholder="작품에 대한 설명을 입력하세요. (예: 언제, 어디서, 왜 촬영했는지)"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-4 rounded-lg font-bold text-base transition-all ${
                  canSubmit
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? '제출 중...' : '제출하기'}
              </button>

              {/* 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-medium mb-1">✅ 제출 후 기억하세요:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>심사는 1~3일 정도 소요됩니다</li>
                  <li>승인되면 포인트가 자동으로 지급됩니다</li>
                  <li>우수작은 디지털 아카이브에 영구 전시됩니다</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

function SubmitPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SubmitForm />
    </Suspense>
  )
}

import { Suspense } from 'react'
export default SubmitPage
