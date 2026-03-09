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
    {
      href: '/dashboard',
      label: 'Prompts',
      exact: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4 6h8M4 9h5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.11 3.11l1.42 1.42M11.47 11.47l1.42 1.42M12.89 3.11l-1.42 1.42M4.53 11.47l-1.42 1.42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen sticky top-0" style={{ borderRight: '1px solid #242424', background: '#0d0d0d' }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: '#242424' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7C3AED, #a855f7)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.5"/>
              <path d="M4 6h6M4 8.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-white text-sm">PromptVault</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                active ? "text-white" : "hover:text-white"
              )}
              style={active ? {
                background: 'rgba(124,58,237,0.12)',
                color: 'white',
              } : { color: '#888' }}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: '#7C3AED' }} />
              )}
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: '#242424' }}>
        <div className="flex items-center gap-2.5 p-2 rounded-lg mb-1" style={{ background: '#161616' }}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ background: 'linear-gradient(135deg, #7C3AED, #a855f7)' }}>
              {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{user.name ?? 'User'}</div>
            <div className="text-xs truncate" style={{ color: '#888' }}>{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-xs px-2 py-1.5 rounded-lg transition-colors text-left"
          style={{ color: '#888' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EDEDED'; (e.currentTarget as HTMLButtonElement).style.background = '#161616'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
