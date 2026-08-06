'use client'

import Link from 'next/link'
import { type Profile } from '@/lib/types'

export default function DashboardHero({ profile }: { profile: Profile }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-teal-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-3">
          안녕하세요, <span className="text-purple-100">{profile.name ?? '회원'}</span>님!
        </h1>
        <p className="text-lg text-purple-100 mb-8 leading-relaxed">
          당신의 평남 기억을 찾아주셔서 감사합니다.<br />
          <strong className="text-white">우리가 함께 1세대의 역사를 보존하고 있습니다.</strong>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Link
            href="/missions"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition inline-flex items-center gap-2"
          >
            🎯 미션 시작하기
          </Link>
          <Link
            href="/archive"
            className="bg-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition inline-flex items-center gap-2"
          >
            📚 아카이브 보기
          </Link>
        </div>

        {/* 통계 */}
        <div className="mt-8 pt-6 border-t border-purple-400 grid grid-cols-3 gap-4">
          <div>
            <div className="text-3xl font-bold">{profile.points ?? 0}</div>
            <div className="text-sm text-purple-100">포인트</div>
          </div>
          <div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-purple-100">완료한 미션</div>
          </div>
          <div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-purple-100">배지</div>
          </div>
        </div>
      </div>
    </div>
  )
}
