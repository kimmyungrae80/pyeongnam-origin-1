'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

type AuthMode = 'login' | 'signup'

function AuthForm() {
  const searchParams = useSearchParams()
  const requestedMode = searchParams.get('mode')
  const mode: AuthMode = requestedMode === 'signup' ? 'signup' : 'login'
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    passwordConfirm: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 검증
    if (!form.email || !form.password || !form.name) {
      setError('모든 필드를 입력해주세요.')
      setLoading(false)
      return
    }

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    try {
      // Supabase 환경 변수 확인
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다. 관리자에게 문의하세요.')
      }

      const { error: signUpError, data } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      // DB 트리거가 프로필을 생성합니다. 이메일 확인이 생략된 환경이면 바로 시작합니다.
      if (data.session) {
        router.push('/onboarding')
        router.refresh()
        return
      }

      setSuccess(true)
      setForm({ email: '', password: '', name: '', passwordConfirm: '' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '가입 중 오류가 발생했습니다.'
      console.error('회원가입 에러:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.email || !form.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) throw signInError

      // 로그인 성공 - 대시보드로 이동
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* 타이틀 */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌱</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? '로그인' : '회원가입'}
            </h1>
            <p className="text-gray-500">
              {isLogin ? '평남의 뿌리를 함께 찾아보세요' : '평남 오리진에 참여하세요'}
            </p>
          </div>

          {/* 성공 메시지 */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
              <p className="font-medium">✅ 회원가입이 완료되었습니다!</p>
              <p className="text-sm mt-2">
                이제 이메일을 확인하고 <Link href="/auth" className="font-medium hover:underline">로그인</Link>해주세요.
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="card space-y-4">
            {/* 이름 (회원가입만) */}
            {!isLogin && (
              <div>
                <label className="label-base font-medium mb-2">이름</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="input-base"
                  required
                />
              </div>
            )}

            {/* 이메일 */}
            <div>
              <label className="label-base font-medium mb-2">이메일</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input-base"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="label-base font-medium mb-2">비밀번호</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••"
                className="input-base"
                required
              />
              {!isLogin && (
                <p className="text-xs text-gray-400 mt-1">최소 6자 이상</p>
              )}
            </div>

            {/* 비밀번호 확인 (회원가입만) */}
            {!isLogin && (
              <div>
                <label className="label-base font-medium mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="input-base"
                  required
                />
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all disabled:bg-gray-300"
            >
              {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
            </button>

            {/* 모드 전환 */}
            <div className="text-center pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                <Link
                  href={isLogin ? '/auth?mode=signup' : '/auth'}
                  className="text-purple-600 font-medium ml-1 hover:underline"
                >
                  {isLogin ? '회원가입' : '로그인'}
                </Link>
              </p>
            </div>
          </form>

          {/* 정보 안내 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-medium mb-2">💡 로그인 팁</p>
            <ul className="space-y-1 text-xs">
              <li>✅ 회원가입 후 이메일 확인 필요 (프로젝트 설정에 따라 생략 가능)</li>
              <li>✅ 로그인 후 온보딩을 거쳐 참여를 시작할 수 있습니다</li>
              <li>✅ 비밀번호는 안전하게 보관되며 관리자도 볼 수 없습니다</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <AuthForm />
    </Suspense>
  )
}
