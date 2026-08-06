import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TRACK_EMOJIS, TRACK_LABELS } from '@/lib/types'
import type { Mission, Track } from '@/lib/types'

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string; difficulty?: string }>
}) {
  const filters = await searchParams
  const supabase = await createClient()

  // 미션 조회
  let query = supabase
    .from('missions')
    .select('*')
    .eq('is_active', true)
    .order('order_num')

  if (filters.track) {
    query = query.eq('track', filters.track)
  }
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  const { data: missions } = await query

  // 사용자의 제출물 조회 (완료된 미션 확인용)
  const { data: { user } } = await supabase.auth.getUser()
  const { data: submissions } = user
    ? await supabase
        .from('submissions')
        .select('mission_id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
    : { data: null }

  const completedMissionIds = new Set(submissions?.map(s => s.mission_id) || [])

  const tracks = Object.entries(TRACK_LABELS).map(([key, label]) => ({
    value: key as Track,
    label,
  }))

  const difficulties = [
    { value: 'easy', label: '쉬움 ☀️' },
    { value: 'medium', label: '중간 🌤️' },
    { value: 'hard', label: '어려움 ⛈️' },
  ]

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">🎯 미션 목록</h1>
            <p className="text-purple-100">
              나에게 맞는 미션을 찾아 평남의 뿌리를 탐색해보세요
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 필터 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">필터</h2>
            <div className="flex flex-wrap gap-2">
              {/* 초기화 */}
              <Link
                href="/missions"
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  !filters.track && !filters.difficulty
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                전체 보기
              </Link>

              {/* 트랙 필터 */}
              <div className="flex gap-2 flex-wrap border-l border-gray-300 pl-2 ml-2">
                {tracks.map(track => (
                  <Link
                    key={track.value}
                    href={`/missions?track=${track.value}${filters.difficulty ? `&difficulty=${filters.difficulty}` : ''}`}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      filters.track === track.value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {TRACK_EMOJIS[track.value]} {track.label}
                  </Link>
                ))}
              </div>

              {/* 난이도 필터 */}
              <div className="flex gap-2 flex-wrap border-l border-gray-300 pl-2 ml-2">
                {difficulties.map(difficulty => (
                  <Link
                    key={difficulty.value}
                    href={`/missions${filters.track ? `?track=${filters.track}&` : '?'}difficulty=${difficulty.value}`}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      filters.difficulty === difficulty.value
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {difficulty.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 미션 그리드 */}
          {missions && missions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(missions as Mission[]).map((mission) => {
                const isCompleted = completedMissionIds.has(mission.id)
                return (
                  <div
                    key={mission.id}
                    className="card hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-purple-50 to-teal-50 p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {TRACK_EMOJIS[mission.track as Track]}
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                            {TRACK_LABELS[mission.track as Track]}
                          </span>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                          mission.difficulty === 'easy'
                            ? 'bg-green-100 text-green-700'
                            : mission.difficulty === 'medium'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {mission.difficulty === 'easy'
                            ? '쉬움'
                            : mission.difficulty === 'medium'
                            ? '중간'
                            : '어려움'}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {mission.title}
                      </h3>
                    </div>

                    {/* 본문 */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {mission.description}
                    </p>

                    {/* 푸터 */}
                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <>
                            <span className="text-2xl">✅</span>
                            <div className="text-sm">
                              <div className="font-bold text-green-600">완료됨</div>
                              <div className="text-xs text-gray-500">+{mission.points}p 획득</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl">⭐</span>
                            <div className="text-sm">
                              <div className="font-bold text-purple-600">+{mission.points}p</div>
                              <div className="text-xs text-gray-500">
                                {mission.is_family_mission && `×${mission.family_bonus_multiplier} (가족)`}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {!isCompleted && (
                        <Link
                          href={`/submit?mission=${mission.id}`}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          제출하기 →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">미션이 없습니다</h3>
              <p className="text-gray-500">
                필터를 조정해서 다시 시도해보세요.
              </p>
              <Link href="/missions" className="btn-outline mt-6 inline-block">
                전체 미션 보기
              </Link>
            </div>
          )}

          {/* 안내 */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">💡 미션 완료 팁</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ 한 개의 미션을 완료해야 포인트를 얻습니다.</li>
              <li>✅ 어려운 미션일수록 더 많은 포인트를 얻습니다.</li>
              <li>✅ 가족이 함께 하는 미션은 추가 보너스(×{missions?.[0]?.family_bonus_multiplier || 1.5})가 있습니다.</li>
              <li>✅ 심사 후 승인되면 포인트가 지급되고 아카이브에 공개될 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
