'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Prompts', icon: '📝', exact: true },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside className="w-60 shrink-0 border-r border-white/10 bg-[#0a0a0a] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🔒</span>
          <span className="font-bold text-white">PromptVault</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
              {user.name?.[0] ?? user.email?.[0] ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{user.name ?? 'User'}</div>
            <div className="text-xs text-white/40 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-xs text-white/30 hover:text-white/60 transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
