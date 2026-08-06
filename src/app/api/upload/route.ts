// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = (formData.get('path') as string) || 'submissions'

    if (!file) {
      return NextResponse.json(
        { error: '파일을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (2GB까지)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024 // 2GB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '파일이 너무 큽니다. 2GB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    const ALLOWED_TYPES = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
      'application/pdf',
    ]
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (영상, 사진, PDF, 텍스트만 가능)' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 파일명: 사용자ID_타임스탐프_원본파일명
    const timestamp = Date.now()
    const filename = `${user.id}_${timestamp}_${file.name}`
    const filepath = `${path}/${filename}`

    // Supabase Storage에 업로드
    const { error } = await supabase.storage
      .from('submissions')
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다. 나중에 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    // 공개 URL 생성
    const { data: publicUrl } = supabase.storage
      .from('submissions')
      .getPublicUrl(filepath)

    return NextResponse.json({
      success: true,
      url: publicUrl.publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })

  } catch (err) {
    console.error('Upload exception:', err)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
