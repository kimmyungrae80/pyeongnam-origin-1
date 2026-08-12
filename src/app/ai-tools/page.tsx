import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CharacterMascot } from '@/components/Character'

const AI_TOOLS = [
  {
    href: '/interview-helper',
    icon: '🎤',
    title: 'AI 인터뷰 질문',
    description: '가족 정보를 바탕으로 따뜻하고 자연스러운 인터뷰 질문을 만들어드립니다.',
    action: '질문 만들기',
    color: 'from-purple-50 to-violet-50 border-purple-200',
  },
  {
    href: '/story-generator',
    icon: '📖',
    title: 'AI 이야기 초안',
    description: '인터뷰 기록을 읽기 좋은 가족 이야기와 에세이 초안으로 정리해드립니다.',
    action: '이야기 만들기',
    color: 'from-pink-50 to-blue-50 border-pink-200',
  },
  {
    href: '/term-explainer',
    icon: '📚',
    title: 'AI 평남 용어 설명',
    description: '문서 속 어려운 평안남도 역사·문화·지리 용어를 알기 쉽게 설명해드립니다.',
    action: '용어 알아보기',
    color: 'from-amber-50 to-orange-50 border-amber-200',
  },
]

export default function AiToolsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <CharacterMascot className="w-20 h-20 mx-auto mb-4" />
            <div className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 mb-3">
              ✨ 평남 오리진 AI
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI 도구</h1>
            <p className="text-gray-500 mt-2">가족의 기억을 질문하고, 기록하고, 이해하는 일을 AI가 도와드립니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AI_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group rounded-2xl border bg-gradient-to-br ${tool.color} p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="text-5xl mb-5" aria-hidden="true">{tool.icon}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{tool.title}</h2>
                <p className="text-sm leading-6 text-gray-600 min-h-24">{tool.description}</p>
                <div className="mt-5 font-bold text-purple-700 group-hover:text-purple-900">
                  {tool.action} →
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-900">
            AI가 만든 내용은 초안입니다. 가족의 실제 기억과 자료를 바탕으로 확인하고 다듬어 주세요.
          </div>
        </div>
      </main>
    </>
  )
}
