import { NextRequest, NextResponse } from 'next/server'
import { generateWithClaude } from '@/lib/anthropic'

interface GenerateDraftRequest {
  title: string
  interviewContent: string
  relationship: string
  tone?: string
  length?: 'balanced' | 'detailed' | 'archive'
}

const LENGTH_SETTINGS = {
  balanced: { label: '원문과 비슷한 분량', ratio: 1, min: 800, max: 2200 },
  detailed: { label: '원문보다 풍부한 분량', ratio: 1.3, min: 1200, max: 3500 },
  archive: { label: '빠짐없이 자세한 기록문', ratio: 1.6, min: 1800, max: 5000 },
} as const

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
    const lengthMode = body.length && body.length in LENGTH_SETTINGS ? body.length : 'detailed'
    const lengthSetting = LENGTH_SETTINGS[lengthMode]
    const sourceLength = body.interviewContent.trim().length
    const targetLength = Math.min(
      lengthSetting.max,
      Math.max(lengthSetting.min, Math.round(sourceLength * lengthSetting.ratio))
    )

    const userPrompt = `인터뷰 노트를 사실에 충실한 풍부한 가족 이야기로 다듬어주세요.

제목: ${body.title}
관계: ${body.relationship}

인터뷰 노트:
${body.interviewContent}

요청사항:
1. 인터뷰에 나온 인명, 지명, 연도, 사건, 관계, 순서와 구체적인 기억을 빠뜨리지 말 것
2. 인터뷰에 없는 사실, 대화, 감정, 장면을 새로 만들거나 사실처럼 단정하지 말 것
3. 요약문이 아니라 처음부터 끝까지 자연스럽게 읽히는 가족 이야기로 재구성할 것
4. 원문의 말투와 감정은 살리되 반복되는 표현만 정돈할 것
5. 톤: ${tone}
6. 분량: ${lengthSetting.label}, 약 ${targetLength}자 내외. 충분한 문단으로 나누고 지나치게 압축하지 말 것
7. 평안남도의 문화적 배경은 인터뷰에 언급된 내용만 사실로 사용할 것. 일반적인 시대 배경을 보충해야 한다면 추정임을 명확히 밝힐 것
8. 이야기 작성 후 보존한 핵심 사실을 별도 목록으로 제시할 것

아래 태그 형식으로만 응답:
<story>완성된 스토리</story>
<summary>한 문장 요약</summary>
<emotionalTone>감정톤</emotionalTone>
<highlightedPhrases><phrase>표현1</phrase><phrase>표현2</phrase></highlightedPhrases>
<preservedFacts><fact>원문에서 보존한 핵심 사실1</fact><fact>핵심 사실2</fact></preservedFacts>`

    const systemPrompt = `당신은 평안남도 뿌리찾기 프로젝트의 전문 스토리텔러입니다.
인터뷰의 사실과 기억을 빠짐없이 보존하면서 읽기 좋은 가족 기록으로 다듬는 역할을 합니다.
창작으로 빈칸을 채우지 마세요. 확인되지 않은 내용은 사실처럼 쓰지 말고, 원문에 없는 정보는 추가하지 마세요.
평안남도의 역사와 문화를 존중하되 정확성을 감성적 표현보다 우선해야 합니다.`

    const result = await generateWithClaude(
      userPrompt,
      systemPrompt,
      6000
    )

    const getTag = (tag: string) => {
      const match = result.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
      return match?.[1]?.trim() || ''
    }
    const getTagList = (container: string, item: string) => {
      const content = getTag(container)
      return [...content.matchAll(new RegExp(`<${item}>([\\s\\S]*?)</${item}>`, 'g'))]
        .map((match) => match[1].trim())
        .filter(Boolean)
    }

    const story = getTag('story')

    if (!story) {
      return NextResponse.json({
        success: true,
        story: result,
        summary: '인터뷰를 기반으로 한 스토리',
        emotionalTone: '감동적',
        highlightedPhrases: [],
        preservedFacts: [],
      })
    }

    return NextResponse.json({
      success: true,
      story,
      summary: getTag('summary') || '인터뷰를 기반으로 한 가족 이야기',
      emotionalTone: getTag('emotionalTone') || tone,
      highlightedPhrases: getTagList('highlightedPhrases', 'phrase'),
      preservedFacts: getTagList('preservedFacts', 'fact'),
    })
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
