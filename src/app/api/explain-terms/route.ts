import { NextRequest, NextResponse } from 'next/server'
import { generateWithClaude } from '@/lib/anthropic'

interface ExplainTermsRequest {
  text: string
  context?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ExplainTermsRequest = await request.json()

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: '설명할 텍스트를 입력해주세요' },
        { status: 400 }
      )
    }

    const contextInfo = body.context ? `\n맥락: ${body.context}` : ''

    const userPrompt = `다음 텍스트에서 평안남도 역사, 문화, 지리와 관련된 중요한 용어들을 찾아 설명해주세요.

텍스트:
${body.text}${contextInfo}

요청사항:
1. 핵심 용어 5-10개 추출
2. 각 용어에 대해:
   - 정의 (100자 이내)
   - 평안남도와의 연관성
   - 역사적 의미
3. 현재 또는 과거 관련성 표시
4. 사용자가 쉽게 이해할 수 있도록 설명

JSON 형식으로 응답:
\`\`\`json
{
  "terms": [
    {
      "term": "용어",
      "definition": "정의",
      "relevance": "평안남도와의 연관성",
      "historicalContext": "역사적 의미",
      "timeframe": "과거|현재|양쪽"
    }
  ],
  "summary": "전체 요약"
}
\`\`\``

    const systemPrompt = `당신은 평안남도 역사와 문화 전문가입니다.
텍스트에서 역사, 지리, 문화 관련 용어를 찾아 평안남도의 맥락에서 설명합니다.
특히 3-4세대 가족들이 이해할 수 있도록 친근하게 설명해야 합니다.
평안남도의 행정 구역, 지역 문화, 역사적 사건, 전통 등을 포함합니다.`

    const result = await generateWithClaude(
      userPrompt,
      systemPrompt,
      2000
    )

    try {
      const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/)
      const jsonString = jsonMatch ? jsonMatch[1] : result
      const parsedResult = JSON.parse(jsonString)

      return NextResponse.json({
        success: true,
        terms: parsedResult.terms,
        summary: parsedResult.summary,
      })
    } catch {
      return NextResponse.json({
        success: true,
        terms: [],
        summary: result,
      })
    }
  } catch (error) {
    console.error('용어 설명 오류:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '용어 설명 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
