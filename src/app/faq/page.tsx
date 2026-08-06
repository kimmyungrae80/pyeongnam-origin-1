'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const FAQS = [
  {
    category: '참여',
    items: [
      {
        q: '누가 참여할 수 있나요?',
        a: '평안남도 출신 3·4세대라면 누구나 참여할 수 있습니다. 할아버지나 할머니가 평남 출신이라면 당신도 참여 대상입니다.',
      },
      {
        q: '여러 세대가 한 가족으로 참여할 수 있나요?',
        a: '네, 가능합니다! 가족 초대 코드를 사용하면 여러 세대가 한 가문으로 참여할 수 있습니다.',
      },
      {
        q: '미션을 꼭 순서대로 해야 하나요?',
        a: '아니요, 자유롭게 선택해서 진행할 수 있습니다. 어려운 미션부터 쉬운 미션까지 취향대로 진행하세요.',
      },
      {
        q: '한 번에 여러 미션을 진행할 수 있나요?',
        a: '네, 가능합니다! 동시에 여러 미션을 진행하고 차례대로 제출할 수 있습니다.',
      },
    ],
  },
  {
    category: '포인트 & 배지',
    items: [
      {
        q: '포인트는 무엇인가요?',
        a: '미션을 완료하면 받는 가상 화폐입니다. 난이도가 높을수록 더 많은 포인트를 얻습니다.',
      },
      {
        q: '포인트는 언제 지급되나요?',
        a: '관리자가 제출물을 승인한 후 자동으로 지급됩니다. 보통 1~3일이 소요됩니다.',
      },
      {
        q: '패밀리 보너스가 무엇인가요?',
        a: '가족이 함께 하는 미션을 완료하면 추가 보너스(×1.3~1.5배)가 주어집니다.',
      },
      {
        q: '배지는 어떻게 얻나요?',
        a: '특정 조건을 만족하면 배지를 얻습니다. 예: 첫 미션 완료, 포인트 100 달성 등',
      },
      {
        q: '포인트로 뭘 할 수 있나요?',
        a: '현재는 기록용이지만, 추후 상품 교환이나 커뮤니티 활동에 사용될 수 있습니다.',
      },
    ],
  },
  {
    category: '미션 & 제출',
    items: [
      {
        q: '파일을 어떤 형식으로 업로드해야 하나요?',
        a: '사진(JPG, PNG, WebP), 영상(MP4, WebM, MOV), 문서(PDF, TXT)를 지원합니다. 최대 2GB까지 가능합니다.',
      },
      {
        q: '영상을 어디서 촬영한 후 올리나요?',
        a: '스마트폰이나 카메라로 자유롭게 촬영하면 됩니다. 큰 영상 파일은 YouTube/Instagram/TikTok에 먼저 올린 후 링크를 제출해주세요.',
        isHighlight: true,
      },
      {
        q: '편집하지 않은 원본을 제출해야 하나요?',
        a: '아니요, 자유롭게 편집해서 제출해도 됩니다. 하지만 자연스럽고 진심 어린 내용이 심사를 통과할 확률이 높습니다.',
      },
      {
        q: '제출 후 수정할 수 있나요?',
        a: '심사 중에는 수정할 수 없습니다. 반려되면 수정 후 다시 제출할 수 있습니다.',
      },
      {
        q: '한 번에 여러 파일을 올릴 수 있나요?',
        a: '현재는 미션당 1개 파일만 업로드 가능합니다. 여러 파일이 필요하면 하나로 묶어서 올려주세요.',
      },
    ],
  },
  {
    category: '심사 & 저작권',
    items: [
      {
        q: '제출물은 언제 심사되나요?',
        a: '보통 1~3일 이내에 심사됩니다. 주말과 공휴일은 제외될 수 있습니다.',
      },
      {
        q: '반려되면 어떻게 하나요?',
        a: '반려 사유를 함께 알려드립니다. 수정 후 다시 제출할 수 있습니다.',
      },
      {
        q: '왜 반려되었어요?',
        a: '가능한 이유: (1) 미션 주제와 맞지 않음, (2) 저작권 문제, (3) 부적절한 콘텐츠, (4) 중복 제출. 구체적인 이유는 대시보드에서 확인할 수 있습니다.',
      },
      {
        q: '내 콘텐츠의 저작권은 어떻게 되나요?',
        a: '모든 저작권은 제출자에게 있습니다. 다만 플랫폼에서 콘텐츠를 아카이브에 공개하고 마케팅에 사용할 수 있도록 동의하신 것입니다.',
      },
      {
        q: '다른 사람의 사진을 사용해도 되나요?',
        a: '저작권이 없는 할아버지/할머니 사진이라면 가능합니다. 하지만 다른 사람의 사진을 사용할 때는 반드시 동의를 받으세요.',
      },
    ],
  },
  {
    category: '아카이브 & 시상',
    items: [
      {
        q: '아카이브에 공개되면 누가 볼 수 있나요?',
        a: '누구나 볼 수 있습니다. 로그인하지 않아도 헤리티지 아카이브를 둘러볼 수 있습니다.',
      },
      {
        q: '아카이브에 공개되기 싫으면?',
        a: '제출할 때 "비공개" 옵션을 선택할 수 있습니다. (구현 예정)',
      },
      {
        q: '우수작은 어떻게 선정되나요?',
        a: '도민 사회관계자, 외부 전문가, 청년 투표단이 함께 심사합니다.',
      },
      {
        q: '시상식은 언제인가요?',
        a: '12월에 진행됩니다. 상세한 일정은 추후 공지될 예정입니다.',
      },
      {
        q: '상품은 뭐예요?',
        a: '상품권과 상장이 주어집니다. 대상(50만원), 최우수상(30만원), 우수상(20만원), 장려상(10만원, 7명)',
      },
    ],
  },
  {
    category: '기술',
    items: [
      {
        q: '모바일에서도 사용할 수 있나요?',
        a: '네, 완벽하게 반응형으로 구현되어 있습니다. 스마트폰에서도 쉽게 사용할 수 있습니다.',
      },
      {
        q: '업로드 중에 연결이 끊기면?',
        a: '다시 시도해주세요. 업로드는 안전하게 처리되며, 실패 시 알림을 드립니다.',
      },
      {
        q: '비밀번호를 잊었어요',
        a: '로그인 페이지에서 "비밀번호 찾기"를 클릭하면 이메일로 초기화 링크를 보내드립니다. (구현 예정)',
      },
      {
        q: '계정을 탈퇴하고 싶어요',
        a: '프로필 페이지에서 탈퇴할 수 있습니다. 탈퇴하면 모든 정보가 삭제됩니다.',
      },
    ],
  },
]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">❓ 자주 묻는 질문</h1>
            <p className="text-purple-100">
              궁금한 점을 여기서 찾아보세요
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* 검색 안내 */}
          <div className="card bg-blue-50 border-blue-200 mb-8">
            <p className="text-sm text-gray-600">
              💡 <Link href="/guide" className="text-purple-600 font-medium hover:underline">상세한 참여 가이드</Link>를 원하신다면 &quot;참여 방법 안내&quot; 페이지를 방문하세요.
            </p>
          </div>

          {/* FAQ 섹션 */}
          <div className="space-y-8">
            {FAQS.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.category}
                </h2>

                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => {
                    const globalIndex = sectionIndex * 100 + itemIndex
                    const isOpen = openIndex === globalIndex

                    return (
                      <button
                        key={itemIndex}
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className={`w-full card text-left transition-all hover:shadow-md ${
                          item.isHighlight
                            ? 'border-l-4 border-purple-600 bg-purple-50'
                            : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-medium text-gray-900 flex-1">
                            {item.q}
                          </h3>
                          <span className={`flex-shrink-0 text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>

                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-gray-700 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 더 이상 질문 없음 */}
          <div className="card bg-gradient-to-r from-purple-50 to-teal-50 border-purple-200 mt-12 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">질문이 더 있으신가요?</h3>
            <p className="text-gray-600 mb-6">
              홈페이지 하단의 연락처로 문의해주시면 빠르게 답변드리겠습니다.
            </p>
            <Link href="/" className="btn-primary px-8 py-3 inline-block">
              홈으로 돌아가기 →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
