'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSignIn = async (provider: string) => {
    setLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#080808' }}>
      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* Amber glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5" style={{ background: '#F59E0B' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="4" width="18" height="14" rx="2.5" stroke="#080808" strokeWidth="1.8"/>
              <path d="M6 9h10M6 13h6.5" stroke="#080808" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">PromptVault</h1>
          <p className="text-sm mt-2" style={{ color: '#888' }}>Sign in to your vault</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ border: '1px solid #222', background: '#0f0f0f' }}>
          <button
            onClick={() => handleSignIn('github')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all"
            style={{ border: '1px solid #333', background: '#141414' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.5)'; (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#333'; (e.currentTarget as HTMLButtonElement).style.background = '#141414'; }}
          >
            {loading === 'github' ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#444', borderTopColor: '#F59E0B' }} />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#555' }}>
          By continuing, you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}
