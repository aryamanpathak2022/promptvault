import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#080808] md:flex">
      <DashboardSidebar user={session.user} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
