import { NextRequest, NextResponse } from 'next/server'
import { generateWithClaude } from '@/lib/anthropic'

interface GenerateDraftRequest {
  title: string
  interviewContent: string
  relationship: string
  tone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDraftRequest = await request.json()

    if (!body.title || !body.interviewContent || !body.relationship) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    const tone = body.tone || '따뜻하고 회상적인'

    const userPrompt = `인터뷰 노트를 감동적인 가족 에세이로 변환해주세요.

제목: ${body.title}
관계: ${body.relationship}

인터뷰 노트:
${body.interviewContent}

요청사항:
1. 자연스러운 스토리 형식으로 재구성
2. 톤: ${tone}
3. 3-4개의 문단 (각 150-200자)
4. 개인 감정과 추억을 섬세하게 담기
5. 평안남도의 문화적 배경 살리기

JSON 형식으로 응답:
\`\`\`json
{
  "story": "완성된 스토리",
  "summary": "한 문장 요약",
  "emotionalTone": "감정톤",
  "highlightedPhrases": ["표현1", "표현2"]
}
\`\`\``

    const systemPrompt = `당신은 평안남도 뿌리찾기 프로젝트의 전문 스토리텔러입니다.
인터뷰 노트를 감동적인 가족 에세이로 변환하는 역할을 합니다.
평안남도의 역사와 문화를 존중하면서 생생한 서사를 만들어야 합니다.`

    const result = await generateWithClaude(
      userPrompt,
      systemPrompt,
      3000
    )

    try {
      const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/)
      const jsonString = jsonMatch ? jsonMatch[1] : result
      const parsedResult = JSON.parse(jsonString)

      return NextResponse.json({
        success: true,
        story: parsedResult.story,
        summary: parsedResult.summary,
        emotionalTone: parsedResult.emotionalTone,
        highlightedPhrases: parsedResult.highlightedPhrases,
      })
    } catch {
      return NextResponse.json({
        success: true,
        story: result,
        summary: '인터뷰를 기반으로 한 스토리',
        emotionalTone: '감동적',
        highlightedPhrases: [],
      })
    }
  } catch (error) {
    console.error('스토리 생성 오류:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '스토리 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
