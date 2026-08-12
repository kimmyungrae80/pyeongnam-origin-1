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

    // 상태 변경, 포인트 지급, 아카이브/배지 생성을 DB 트랜잭션으로 처리
    const { error: approveError } = await supabase.rpc('approve_submission', {
      p_submission_id: submission_id,
    })

    if (approveError) throw approveError

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
