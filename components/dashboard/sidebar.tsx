'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Prompts',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4 6h8M4 9h5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.11 3.11l1.42 1.42M11.47 11.47l1.42 1.42M12.89 3.11l-1.42 1.42M4.53 11.47l-1.42 1.42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
]

function UserAvatar({ user }: { user: User }) {
  if (user.image) {
    return <img src={user.image} alt="" className="h-9 w-9 rounded-full object-cover" />
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-semibold text-[#080808]">
      {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function NavLinks({ pathname }: { pathname: string }) {
  return navItems.map((item) => {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-zinc-50'
            : 'border-transparent text-zinc-400 hover:border-[#262626] hover:bg-[#151515] hover:text-zinc-100'
        )}
      >
        {item.icon}
        {item.label}
      </Link>
    )
  })
}

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  return (
    <>
      <div className="border-b border-[#1d1d1d] bg-[#0d0d0d] px-4 py-4 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F59E0B] text-[#080808]">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 6h6M4 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-50">PromptVault</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-[#F59E0B]/40 hover:text-zinc-50"
          >
            Sign out
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <NavLinks pathname={pathname} />
        </div>
      </div>

      <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[#1d1d1d] bg-[#0d0d0d] md:flex md:flex-col">
        <div className="border-b border-[#1d1d1d] px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F59E0B] text-[#080808]">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 6h6M4 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-50">PromptVault</p>
              <p className="text-xs text-zinc-500">Prompt version control</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="border-t border-[#1d1d1d] p-4">
          <div className="rounded-2xl border border-[#222222] bg-[#111111] p-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-50">{user.name ?? 'PromptVault user'}</p>
                <p className="truncate text-xs text-zinc-500">{user.email ?? 'Signed in with GitHub'}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-3 w-full rounded-xl border border-[#2a2a2a] px-3 py-2 text-left text-xs font-medium text-zinc-300 transition-colors hover:border-[#F59E0B]/40 hover:bg-[#171717] hover:text-zinc-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
