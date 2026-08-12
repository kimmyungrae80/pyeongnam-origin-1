// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'multipart/form-data 형식의 파일 요청이 필요합니다.' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: '파일을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 서버 경유 업로드는 배포 플랫폼 요청 제한보다 작게 유지합니다.
    const MAX_SIZE = 4 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '파일이 너무 큽니다. 4MB 이하 파일만 직접 업로드할 수 있습니다.' },
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
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${timestamp}_${safeName}`
    // Storage RLS 정책의 첫 폴더(auth.uid())와 반드시 일치해야 합니다.
    const filepath = `${user.id}/${filename}`

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
