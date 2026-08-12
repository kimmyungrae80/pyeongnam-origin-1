import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/onboarding'

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=missing_code', url.origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/auth?error=callback_failed', url.origin))
  }

  return NextResponse.redirect(new URL(destination, url.origin))
}
