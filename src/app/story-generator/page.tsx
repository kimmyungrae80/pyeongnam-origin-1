'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CharacterMascot } from '@/components/Character'

interface Story {
  story: string
  summary: string
  emotionalTone: string
  highlightedPhrases: string[]
}

export default function StoryGeneratorPage() {
  const [title, setTitle] = useState('')
  const [interviewContent, setInterviewContent] = useState('')
  const [relationship, setRelationship] = useState('조부모')
  const [selectedTone, setSelectedTone] = useState('따뜻하고 회상적인')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [story, setStory] = useState<Story | null>(null)
  const [copied, setCopied] = useState(false)

  const TONES = ['따뜻하고 회상적인', '차분하고 명상적인', '생생하고 역동적인', '향수적인', '강인한']

  const handleGenerateStory = async () => {
    if (!title.trim()) {
      setError('스토리 제목을 입력해주세요')
      return
    }

    if (!interviewContent.trim()) {
      setError('인터뷰 내용을 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setStory(null)

    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          interviewContent,
          relationship,
          tone: selectedTone,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '스토리 생성 실패')
      }

      const data = await response.json()
      setStory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (story?.story) {
      navigator.clipboard.writeText(story.story)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <CharacterMascot className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">📖 인터뷰 → 스토리 변환기</h1>
            <p className="text-gray-500 mt-2">인터뷰 노트를 감동적인 가족 에세이로 변환하세요</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 입력 섹션 */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">✍️ 인터뷰 정보</h2>

                <div className="mb-4">
                  <label className="label-base font-medium mb-2">스토리 제목 *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 평양에서의 어린 시절"
                    className="input-base"
                  />
                </div>

                <div className="mb-4">
                  <label className="label-base font-medium mb-2">관계</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="input-base"
                  >
                    <option>조부모</option>
                    <option>부모</option>
                    <option>친척</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="label-base font-medium mb-2">감정 톤</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`p-2 rounded-lg text-sm transition-all border ${
                          selectedTone === tone
                            ? 'border-purple-600 bg-purple-50 text-purple-900'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="label-base font-medium mb-2">인터뷰 내용 *</label>
                  <textarea
                    value={interviewContent}
                    onChange={(e) => setInterviewContent(e.target.value)}
                    placeholder="인터뷰 질문과 답변을 입력하세요"
                    className="input-base resize-none h-40"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleGenerateStory}
                  disabled={loading}
                  className={`w-full py-3 font-bold rounded-lg transition-all ${
                    loading
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? '스토리 생성 중...' : '✨ 스토리 생성하기'}
                </button>
              </div>
            </div>

            {/* 결과 섹션 */}
            <div className="card">
              {story ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">📖 생성된 스토리</h2>
                    <button
                      onClick={copyToClipboard}
                      className="text-sm px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                    >
                      {copied ? '✓ 복사됨' : '📋 복사'}
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-purple-600 mb-1">요약</p>
                    <p className="text-gray-800 text-sm">{story.summary}</p>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                    <p className="text-gray-900 leading-relaxed text-sm whitespace-pre-wrap">
                      {story.story}
                    </p>
                  </div>

                  <button className="w-full mt-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">
                    이 스토리 저장하기 →
                  </button>
                </>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-5xl mb-3">📝</div>
                  <p>왼쪽에서 인터뷰 내용을 입력하면</p>
                  <p>AI가 감동적인 스토리로 변환해드립니다</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/missions" className="btn-outline px-6 py-3 inline-block">
              ← 미션으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
