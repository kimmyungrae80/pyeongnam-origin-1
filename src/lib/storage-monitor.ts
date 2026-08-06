// lib/storage-monitor.ts
// Supabase Storage 용량 모니터링

import { createClient } from '@/lib/supabase/server'

export interface StorageStats {
  approvedSubmissions: number
  estimatedSizeMb: number
  usagePercent: number
  status: 'safe' | 'warning' | 'critical'
  message: string
}

/**
 * 저장 용량 통계 계산
 * Supabase 무료: 1GB (1000MB)
 */
export async function getStorageStats(): Promise<StorageStats> {
  const supabase = await createClient()

  // 승인된 제출물 조회
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('content_type, file_urls')
    .eq('status', 'approved')

  if (error) {
    console.error('Failed to fetch submissions:', error)
    return {
      approvedSubmissions: 0,
      estimatedSizeMb: 0,
      usagePercent: 0,
      status: 'safe',
      message: '저장 용량 정보를 불러올 수 없습니다.',
    }
  }

  // 파일 타입별 평균 크기 (MB)
  const avgSizeByType: Record<string, number> = {
    photo: 3, // 사진 2-5MB
    video: 300, // 영상 200-400MB
    essay: 0.05, // 에세이 50KB
    design: 5, // 디자인 3-10MB
    map: 2, // 지도 1-3MB
    other: 1, // 기타 1MB
  }

  // 예상 크기 계산
  let estimatedSizeMb = 0
  submissions?.forEach((sub) => {
    if (sub.file_urls && Array.isArray(sub.file_urls)) {
      sub.file_urls.forEach(() => {
        const type = (sub.content_type || 'other') as keyof typeof avgSizeByType
        estimatedSizeMb += avgSizeByType[type] ?? 1
      })
    }
  })

  // Supabase 무료 플랜: 1000MB
  const LIMIT_MB = 1000
  const usagePercent = Math.round((estimatedSizeMb / LIMIT_MB) * 100)

  // 상태 판정
  let status: StorageStats['status'] = 'safe'
  let message = '저장 용량이 충분합니다.'

  if (usagePercent >= 90) {
    status = 'critical'
    message = '⛔ 저장 용량이 거의 찬 상태입니다. 즉시 유료 전환이 필요합니다.'
  } else if (usagePercent >= 70) {
    status = 'warning'
    message = '⚠️ 저장 용량 사용률이 높습니다. 2주 이내 유료 전환을 검토하세요.'
  } else if (usagePercent >= 50) {
    status = 'warning'
    message = '📊 저장 용량 사용률이 증가 중입니다. 계속 모니터링하세요.'
  }

  return {
    approvedSubmissions: submissions?.length ?? 0,
    estimatedSizeMb: Math.round(estimatedSizeMb),
    usagePercent,
    status,
    message,
  }
}

/**
 * 저장 용량 상태를 로그로 기록 (선택사항)
 */
export async function logStorageStatus() {
  const stats = await getStorageStats()
  console.log('📊 Storage Status:', {
    timestamp: new Date().toISOString(),
    estimatedSizeMb: stats.estimatedSizeMb,
    usagePercent: `${stats.usagePercent}%`,
    status: stats.status,
  })
  return stats
}
