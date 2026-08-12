import Anthropic from "@anthropic-ai/sdk";

// Anthropic 클라이언트 생성 (lazy initialization)
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다. " +
      ".env.local 또는 Vercel 환경 변수를 확인하세요."
    );
  }

  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return client;
}

/**
 * Claude API를 통해 텍스트 생성
 * @param prompt - 사용자 프롬프트
 * @param systemPrompt - 시스템 프롬프트 (역할 정의)
 * @param maxTokens - 최대 토큰 수 (기본값: 1024)
 * @returns 생성된 텍스트
 */
export async function generateWithClaude(
  prompt: string,
  systemPrompt: string,
  maxTokens: number = 1024
): Promise<string> {
  try {
    const client = getClient();
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // 텍스트 콘텐츠 추출
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("텍스트 응답을 받지 못했습니다");
    }

    return textContent.text;
  } catch (error) {
    console.error("Claude API 호출 오류:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Claude API 호출 중 오류가 발생했습니다"
    );
  }
}

/**
 * 구조화된 JSON 응답 생성
 * @param prompt - 사용자 프롬프트
 * @param systemPrompt - 시스템 프롬프트
 * @param maxTokens - 최대 토큰 수
 * @returns 파싱된 JSON 객체
 */
export async function generateJSON<T>(
  prompt: string,
  systemPrompt: string,
  maxTokens: number = 2048
): Promise<T> {
  const response = await generateWithClaude(prompt, systemPrompt, maxTokens);

  try {
    // JSON 추출 (```json ... ``` 형식 처리)
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;
    return JSON.parse(jsonString);
  } catch {
    console.error("JSON 파싱 오류:", response);
    throw new Error("AI 응답을 파싱할 수 없습니다");
  }
}
