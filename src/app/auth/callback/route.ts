import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=missing_code', url.origin))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/auth?error=callback_failed', url.origin))
  }

  let destination = next?.startsWith('/') && !next.startsWith('//') ? next : null

  if (!destination && data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .maybeSingle()

    destination = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
  }

  return NextResponse.redirect(new URL(destination ?? '/onboarding', url.origin))
}
