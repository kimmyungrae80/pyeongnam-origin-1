// 평남 오리진 마스코트: "뿌리(Root)" - 평안남도의 뿌리를 나타내는 친근한 캐릭터

export function CharacterMascot({ className = 'w-32 h-32', animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} ${animated ? 'animate-bounce' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 뿌리 (아래) */}
      <g id="roots">
        <path d="M 80 140 Q 60 170 50 190" stroke="#8B6F47" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 100 140 Q 100 180 100 190" stroke="#A0826D" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 120 140 Q 140 170 150 190" stroke="#8B6F47" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>

      {/* 줄기/나무 (중간) */}
      <rect x="85" y="80" width="30" height="65" fill="#6B8E23" rx="15" />

      {/* 잎 (좌측) */}
      <ellipse cx="50" cy="100" rx="20" ry="35" fill="#7CB342" transform="rotate(-35 50 100)" opacity="0.9" />
      <path d="M 50 75 Q 45 90 50 110" stroke="#558B2F" strokeWidth="2" fill="none" />

      {/* 잎 (우측) */}
      <ellipse cx="150" cy="95" rx="22" ry="38" fill="#7CB342" transform="rotate(40 150 95)" opacity="0.9" />
      <path d="M 150 75 Q 155 90 150 110" stroke="#558B2F" strokeWidth="2" fill="none" />

      {/* 잎 (상단) */}
      <ellipse cx="100" cy="50" rx="18" ry="32" fill="#8BC34A" transform="rotate(0 100 50)" opacity="0.95" />
      <path d="M 100 30 Q 95 40 100 50" stroke="#689F38" strokeWidth="2" fill="none" />

      {/* 얼굴 (머리 - 씨앗/알) */}
      <circle cx="100" cy="40" r="28" fill="#F4D03F" />

      {/* 얼굴 표정 - 눈 */}
      <circle cx="90" cy="35" r="5" fill="#333" />
      <circle cx="110" cy="35" r="5" fill="#333" />
      <circle cx="92" cy="33" r="2" fill="white" />
      <circle cx="112" cy="33" r="2" fill="white" />

      {/* 입 (미소) */}
      <path d="M 90 45 Q 100 52 110 45" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* 배경 하이라이트 (반짝임 효과) */}
      <circle cx="92" cy="22" r="6" fill="white" opacity="0.4" />

      {/* 평안남도 색상 포인트 */}
      <circle cx="100" cy="120" r="4" fill="#E65100" opacity="0.6" />
    </svg>
  )
}

export function CharacterLoading() {
  return (
    <div className="flex flex-col items-center gap-4">
      <CharacterMascot className="w-20 h-20 animate-pulse" animated />
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}

export function CharacterWelcome() {
  return (
    <div className="text-center">
      <CharacterMascot className="w-40 h-40 mx-auto mb-4" />
      <p className="text-lg font-medium text-gray-900">뿌리와 함께 평남의 뿌리를 찾아보세요!</p>
      <p className="text-sm text-gray-500 mt-1">이 캐릭터는 평안남도의 뿌리를 상징합니다</p>
    </div>
  )
}
