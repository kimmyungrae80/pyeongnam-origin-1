'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CharacterMascot } from '@/components/Character'

interface Question {
  question: string
  category: string
}

const INTERESTS = [
  '일상사화',
  '전쟁 경험',
  '음식/문화',
  '가족 이야기',
  '학창시절',
]

export default function InterviewHelperPage() {
  const [relationship, setRelationship] = useState('조부모')
  const [familyInfo, setFamilyInfo] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [copied, setCopied] = useState(false)

  const handleInterestChange = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleGenerateQuestions = async () => {
    if (!familyInfo.trim()) {
      setError('가족 정보를 입력해주세요')
      return
    }

    if (selectedInterests.length === 0) {
      setError('관심사를 최소 1개 이상 선택해주세요')
      return
    }

    setLoading(true)
    setError('')
    setQuestions([])

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship,
          familyInfo,
          interests: selectedInterests,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '질문 생성 실패')
      }

      const data = await response.json()
      setQuestions(data.questions)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const text = questions.map((q) => `Q. ${q.question}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <CharacterMascot className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">AI 인터뷰 질문 생성기</h1>
            <p className="text-gray-500 mt-2">
              뿌리와 함께 할아버지/할머니와의 인터뷰 질문을 AI가 만들어드립니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 입력 섹션 */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">📋 인터뷰 설정</h2>

                {/* 관계 선택 */}
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

                {/* 가족 정보 입력 */}
                <div className="mb-4">
                  <label className="label-base font-medium mb-2">
                    가족 정보 *
                  </label>
                  <textarea
                    value={familyInfo}
                    onChange={(e) => setFamilyInfo(e.target.value)}
                    placeholder="예: 평양시 출신, 1948년생, 다사미 지역에 살았다고 함"
                    className="input-base resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    출신지, 생년월일, 직업, 가족 구성 등을 자유롭게 입력하세요
                  </p>
                </div>

                {/* 관심사 선택 */}
                <div>
                  <label className="label-base font-medium mb-2">
                    관심사 (중복 선택 가능) *
                  </label>
                  <div className="space-y-2">
                    {INTERESTS.map((interest) => (
                      <label key={interest} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest)}
                          onChange={() => handleInterestChange(interest)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600"
                        />
                        <span className="text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mt-4 text-sm">
                    ⚠️ {error}
                  </div>
                )}

                {/* 생성 버튼 */}
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  className={`w-full mt-4 py-3 font-bold rounded-lg transition-all ${
                    loading
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? '질문 생성 중...' : '✨ 질문 생성하기'}
                </button>
              </div>

              {/* 정보 박스 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-medium mb-2">💡 팁</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ 자세한 정보를 입력할수록 더 좋은 질문이 생깁니다</li>
                  <li>✓ AI는 자연스럽고 따뜻한 질문을 만듭니다</li>
                  <li>✓ 질문을 복사해서 인터뷰에 사용하세요</li>
                </ul>
              </div>
            </div>

            {/* 결과 섹션 */}
            <div className="card">
              {questions.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">
                      🎤 생성된 질문 ({questions.length}개)
                    </h2>
                    <button
                      onClick={copyToClipboard}
                      className="text-sm px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                    >
                      {copied ? '✓ 복사됨' : '📋 복사'}
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {questions.map((q, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex gap-2 items-start">
                          <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded whitespace-nowrap mt-0.5">
                            {q.category}
                          </span>
                          <p className="text-gray-900 leading-relaxed flex-1">
                            {i + 1}. {q.question}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">
                    이 질문으로 제출 준비하기 →
                  </button>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">🤔</div>
                  <p>왼쪽에서 정보를 입력하고 버튼을 누르면</p>
                  <p>AI가 질문을 생성해드립니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 하단 안내 */}
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
