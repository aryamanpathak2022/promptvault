import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
