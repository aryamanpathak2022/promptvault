import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen flex" style={{ background: '#080808' }}>
      <DashboardSidebar user={session.user} />
      <main className="flex-1 overflow-auto flex flex-col">
        {children}
      </main>
    </div>
  )
}
