import { requireUser } from '@/lib/auth'

export default async function StoryGeneratorLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return children
}
