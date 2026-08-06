import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function GuidePage() {
  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">📚 참여 방법 안내</h1>
            <p className="text-purple-100">
              평남 오리진에 어떻게 참여하는지 알아보세요
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* 1. 회원가입 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣ 회원가입 및 로그인</h2>
            <div className="card space-y-4">
              <p className="text-gray-700">
                먼저 <Link href="/auth?mode=signup" className="text-purple-600 font-medium hover:underline">회원가입</Link>을 합니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">📧 이메일 확인</p>
                <p className="text-sm text-gray-700">
                  회원가입 후 이메일 주소를 확인해야 로그인할 수 있습니다.
                  (프로젝트 설정에 따라 생략 가능)
                </p>
              </div>
            </div>
          </section>

          {/* 2. 온보딩 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2️⃣ 온보딩 설정</h2>
            <div className="card space-y-4">
              <p className="text-gray-700">
                로그인하면 온보딩 페이지로 이동합니다. 다음 정보를 입력해주세요.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">👤</span>
                  <div>
                    <p className="font-medium text-gray-900">이름</p>
                    <p className="text-sm text-gray-600">플랫폼에서 사용할 이름입니다</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">👨‍👩‍👧‍👦</span>
                  <div>
                    <p className="font-medium text-gray-900">세대</p>
                    <p className="text-sm text-gray-600">1세대(할아버지/할머니) ~ 4세대(손자손녀)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🗺️</span>
                  <div>
                    <p className="font-medium text-gray-900">출신지</p>
                    <p className="text-sm text-gray-600">평안남도의 어느 지역 출신인가요?</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🎯</span>
                  <div>
                    <p className="font-medium text-gray-900">관심 트랙</p>
                    <p className="text-sm text-gray-600">
                      스토리텔링, 라이프스타일, 디지털/아트, 자유주제 중 선택
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. 미션 선택 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3️⃣ 미션 선택하기</h2>
            <div className="card space-y-4">
              <p className="text-gray-700">
                온보딩을 완료하면 <Link href="/missions" className="text-purple-600 font-medium hover:underline">미션 페이지</Link>에서 다양한 미션을 볼 수 있습니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">⭐ 포인트</p>
                  <p className="text-sm text-gray-700">각 미션마다 다른 포인트를 얻을 수 있습니다</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">⛈️ 난이도</p>
                  <p className="text-sm text-gray-700">쉬움, 중간, 어려움 중에서 선택하세요</p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 콘텐츠 제출 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4️⃣ 콘텐츠 제출</h2>
            <div className="card space-y-4">
              <p className="text-gray-700">
                미션을 선택하면 제출 페이지로 이동합니다.
              </p>

              <h3 className="font-medium text-gray-900 mt-6">📁 파일 업로드</h3>
              <p className="text-sm text-gray-600 mb-3">다음 형식의 파일을 업로드할 수 있습니다:</p>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm">
                  <span>📸</span>
                  <span><strong>사진:</strong> JPG, PNG, WebP (최대 2GB)</span>
                </li>
                <li className="flex gap-2 text-sm">
                  <span>🎬</span>
                  <span><strong>영상:</strong> MP4, WebM, MOV (최대 2GB)</span>
                </li>
                <li className="flex gap-2 text-sm">
                  <span>📄</span>
                  <span><strong>문서:</strong> PDF, TXT</span>
                </li>
              </ul>

              <h3 className="font-medium text-gray-900 mt-6">💡 영상 업로드 팁</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-gray-700">
                <p className="mb-2">📱 스마트폰에서 촬영한 영상은 직접 업로드하기 어려울 수 있습니다.</p>
                <p>👉 먼저 YouTube, Instagram, TikTok 등에 업로드한 후 링크를 제출해주세요.</p>
              </div>
            </div>
          </section>

          {/* 5. 제목 & 설명 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5️⃣ 제목 및 설명</h2>
            <div className="card space-y-4">
              <p className="text-gray-700">
                파일을 선택한 후 다음을 입력합니다:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span>📝</span>
                  <div>
                    <p className="font-medium text-gray-900">제목 (필수)</p>
                    <p className="text-sm text-gray-600">작품을 나타내는 제목을 입력해주세요</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span>💬</span>
                  <div>
                    <p className="font-medium text-gray-900">설명 (선택)</p>
                    <p className="text-sm text-gray-600">
                      언제, 어디서, 왜 촬영했는지 설명해주세요
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* 6. 심사 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6️⃣ 심사 및 포인트 지급</h2>
            <div className="card space-y-4">
              <p className="text-gray-700">
                제출하면 관리자의 심사를 거칩니다.
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="font-medium text-green-900 mb-1">✅ 승인</p>
                  <p className="text-sm text-green-700">포인트가 자동으로 지급되고 아카이브에 공개됩니다</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="font-medium text-red-900 mb-1">❌ 반려</p>
                  <p className="text-sm text-red-700">
                    이유를 함께 알려드립니다. 수정 후 다시 제출할 수 있습니다
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                ⏳ 심사는 보통 <strong>1~3일</strong> 정도 소요됩니다.
              </p>
            </div>
          </section>

          {/* 7. 아카이브 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7️⃣ 아카이브 공개</h2>
            <div className="card space-y-4">
              <p className="text-gray-700">
                승인된 콘텐츠는 <Link href="/archive" className="text-purple-600 font-medium hover:underline">헤리티지 아카이브</Link>에 공개됩니다.
              </p>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">📚 아카이브란?</p>
                <p className="text-sm text-gray-700">
                  평안남도 3·4세대가 발굴한 가문의 이야기들이 모이는 디지털 박물관입니다.
                  누구나 볼 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="card bg-gradient-to-r from-purple-50 to-teal-50 border-purple-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">지금 시작하세요!</h3>
              <p className="text-gray-600 mb-6">
                평남의 뿌리를 함께 찾아보고 가문의 이야기를 남겨보세요.
              </p>
              <Link href="/auth?mode=signup" className="btn-primary px-8 py-3 inline-block">
                뿌리 찾기 시작하기 →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
