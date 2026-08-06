// components/StorageMonitor.tsx
// 관리자용 저장 용량 모니터

import { getStorageStats } from '@/lib/storage-monitor'

export default async function StorageMonitor() {
  const stats = await getStorageStats()

  const statusColors = {
    safe: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', bar: 'bg-green-500' },
    warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', bar: 'bg-orange-500' },
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', bar: 'bg-red-500' },
  }

  const colors = statusColors[stats.status]

  return (
    <div className={`card border-2 ${colors.border} ${colors.bg}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900 text-sm">💾 저장 용량 (Supabase 무료)</h3>
          <p className={`text-xs mt-1 ${colors.text}`}>{stats.message}</p>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${colors.text}`}>{stats.usagePercent}%</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {stats.estimatedSizeMb} MB / 1,000 MB
          </div>
        </div>
      </div>

      {/* 프로그래스 바 */}
      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${colors.bar} transition-all duration-300`}
          style={{ width: `${Math.min(stats.usagePercent, 100)}%` }}
        />
      </div>

      {/* 통계 정보 */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white bg-opacity-60 rounded p-2">
          <div className="text-gray-500">승인된 제출물</div>
          <div className="font-bold text-gray-900">{stats.approvedSubmissions}건</div>
        </div>
        <div className="bg-white bg-opacity-60 rounded p-2">
          <div className="text-gray-500">평균 파일</div>
          <div className="font-bold text-gray-900">
            {stats.approvedSubmissions > 0
              ? Math.round(stats.estimatedSizeMb / stats.approvedSubmissions)
              : 0}
            MB
          </div>
        </div>
      </div>

      {/* 조치 안내 */}
      {stats.status !== 'safe' && (
        <div className="mt-4 p-3 bg-white bg-opacity-70 rounded border-l-4" style={{ borderColor: 'inherit' }}>
          <p className="text-xs font-medium text-gray-900">🔧 조치 안내</p>
          {stats.status === 'warning' && (
            <ul className="text-xs text-gray-700 mt-1 space-y-1">
              <li>• 주간 저장 용량을 계속 모니터링하세요</li>
              <li>• 필요시 10월 17일 이전에 유료 전환을 검토하세요</li>
            </ul>
          )}
          {stats.status === 'critical' && (
            <ul className="text-xs text-gray-700 mt-1 space-y-1">
              <li>• ⚠️ Vercel Blob으로 즉시 전환이 필요합니다</li>
              <li>• 관리자에게 즉시 알려주세요</li>
              <li>• 전환 가이드: /docs/storage-migration.md 참조</li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
