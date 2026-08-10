import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/anthropic'

interface GenerateQuestionsRequest {
  relationship: string // 조부모 | 부모 | 친척
  familyInfo: string // 출신지, 생년월일 등 가족 정보
  interests: string[] // 관심사 선택
}

interface Question {
  question: string
  category: string // 배경 | 경험 | 감정 | 가족
}

/**
 * AI 인터뷰 질문 생성 API
 * POST /api/generate-questions
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await request.json()

    // 유효성 검사
    if (!body.relationship || !body.familyInfo || !body.interests || body.interests.length === 0) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 관심사를 문자열로 변환
    const interestsList = body.interests.join(', ')

    // AI 프롬프트 작성
    const userPrompt = `
다음 정보를 바탕으로 평안남도 출신 ${body.relationship}와의 인터뷰 질문을 생성해주세요.

**가족 정보:**
${body.familyInfo}

**관심사:**
${interestsList}

8-10개의 자연스럽고 따뜻한 질문을 만들어주세요.
질문은 개인의 경험, 감정, 추억에 초점을 맞추되, 너무 민감하지 않아야 합니다.
각 질문에 카테고리(배경/경험/감정/가족)를 붙여주세요.

JSON 형식으로 다음과 같이 응답해주세요:
\`\`\`json
{
  "questions": [
    {
      "question": "질문 텍스트",
      "category": "카테고리"
    }
  ]
}
\`\`\`
`

    const systemPrompt = `당신은 평안남도 뿌리찾기 프로젝트의 전문 인터뷰어입니다.
평안남도 출신 3-4세대 가족의 이야기를 자연스럽게 이끌어낼 수 있는 질문을 만드는 것이 역할입니다.
질문은 회상적이고 따뜻하며, 가족의 소중한 기억과 감정을 존중해야 합니다.
너무 뻔하지 않으면서도 이해하기 쉬운 질문을 만들어주세요.`

    // Claude API 호출
    const result = await generateJSON<{ questions: Question[] }>(
      userPrompt,
      systemPrompt,
      2048
    )

    return NextResponse.json({
      success: true,
      questions: result.questions,
      count: result.questions.length,
    })
  } catch (error) {
    console.error('질문 생성 오류:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '질문 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
