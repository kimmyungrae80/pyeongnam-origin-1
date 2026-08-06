import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 관리자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 요청 데이터
    const { submission_id } = await request.json()

    if (!submission_id) {
      return NextResponse.json(
        { error: 'submission_id는 필수입니다.' },
        { status: 400 }
      )
    }

    // 제출물 승인
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission_id)

    if (updateError) throw updateError

    // 제출물 정보 조회
    const { data: submission } = await supabase
      .from('submissions')
      .select('*, missions(*)')
      .eq('id', submission_id)
      .maybeSingle()

    if (submission) {
      // 포인트 지급
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', submission.user_id)
        .maybeSingle()

      const currentPoints = userProfile?.points || 0
      const mission = submission.missions as { points: number } | null
      const pointsToAdd = mission?.points || 100

      await supabase
        .from('profiles')
        .update({
          points: currentPoints + pointsToAdd,
        })
        .eq('id', submission.user_id)

      // 아카이브에 추가
      await supabase.from('archive_items').insert({
        submission_id: submission.id,
        user_id: submission.user_id,
        title: submission.title,
        content: submission.content,
        file_urls: submission.file_urls,
        content_type: submission.content_type,
        is_public: true,
        is_featured: false,
        view_count: 0,
      })

      // 첫 미션 완료 시 배지 지급
      const { data: userSubmissions } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', submission.user_id)
        .eq('status', 'approved')

      if ((userSubmissions?.length || 0) === 1) {
        await supabase.from('user_badges').insert({
          user_id: submission.user_id,
          badge_id: '1', // 첫 미션 배지
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '제출물이 승인되었습니다.',
    })
  } catch (err) {
    console.error('Approve error:', err)
    return NextResponse.json(
      { error: '승인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
