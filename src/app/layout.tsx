// src/app/layout.tsx

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '평남 오리진 | 나의 평남, 우리의 뿌리',
  description: '평안남도 3·4세대를 위한 뿌리이음 플랫폼. 나만의 언어로 우리 가문의 이야기를 발견합니다.',
  keywords: ['평안남도', '뿌리찾기', '이북5도', '세대이음', '가족기록'],
  icons: {
    icon: '/brand/pyeongnam-logo.png',
    apple: '/brand/pyeongnam-logo.png',
  },
  openGraph: {
    title: '평남 오리진 | 나의 평남, 우리의 뿌리',
    description: '평안남도 3·4세대를 위한 뿌리이음 플랫폼',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  )
}
