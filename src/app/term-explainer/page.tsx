'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CharacterMascot } from '@/components/Character'

interface Term {
  term: string
  definition: string
  relevance: string
  historicalContext: string
  timeframe: string
}

export default function TermExplainerPage() {
  const [text, setText] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [terms, setTerms] = useState<Term[]>([])
  const [summary, setSummary] = useState('')

  const handleExplain = async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setTerms([])
    setSummary('')

    try {
      const response = await fetch('/api/explain-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          context: context || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '용어 설명 실패')
      }

      const data = await response.json()
      setTerms(data.terms)
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <CharacterMascot className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">📚 평남 용어 설명기</h1>
            <p className="text-gray-500 mt-2">평안남도 역사, 문화 용어를 AI가 설명해드립니다</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 입력 섹션 */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">📖 텍스트 입력</h2>

              <div className="mb-4">
                <label className="label-base font-medium mb-2">설명할 텍스트 *</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="아카이브, 인터뷰, 문서 등의 텍스트를 입력하세요"
                  className="input-base resize-none h-48"
                />
              </div>

              <div className="mb-4">
                <label className="label-base font-medium mb-2">맥락 (선택사항)</label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="예: 1950년대 평양의 일상"
                  className="input-base"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleExplain}
                disabled={loading}
                className={`w-full py-3 font-bold rounded-lg transition-all ${
                  loading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {loading ? '설명 생성 중...' : '✨ 용어 설명하기'}
              </button>
            </div>

            {/* 결과 섹션 */}
            <div className="card">
              {terms.length > 0 ? (
                <>
                  <h2 className="font-bold text-gray-900 mb-4">
                    📚 찾은 용어들 ({terms.length}개)
                  </h2>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {terms.map((term, i) => (
                      <div key={i} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-lg font-bold text-amber-700">{term.term}</span>
                          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                            term.timeframe === '과거' ? 'bg-blue-100 text-blue-700' :
                            term.timeframe === '현재' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {term.timeframe}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1"><strong>정의:</strong> {term.definition}</p>
                        <p className="text-xs text-gray-600 mb-1"><strong>평남과의 연관:</strong> {term.relevance}</p>
                        <p className="text-xs text-gray-600"><strong>역사적 의미:</strong> {term.historicalContext}</p>
                      </div>
                    ))}
                  </div>

                  {summary && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-600 mb-1">요약</p>
                      <p className="text-sm text-gray-800">{summary}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-5xl mb-3">📚</div>
                  <p>왼쪽에서 텍스트를 입력하면</p>
                  <p>평안남도 관련 용어들을 찾아</p>
                  <p>AI가 설명해드립니다</p>
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
