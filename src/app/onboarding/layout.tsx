import { requireUser } from '@/lib/auth'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return children
}
