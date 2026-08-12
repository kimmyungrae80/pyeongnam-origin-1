import { requireUser } from '@/lib/auth'

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return children
}
