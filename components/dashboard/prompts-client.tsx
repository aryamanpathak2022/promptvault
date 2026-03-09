'use client'

import { useState } from 'react'
import Link from 'next/link'
import CreatePromptModal from './create-prompt-modal'

interface Version {
  id: string
  content: string
  version: number
  message: string | null
  model: string | null
  createdAt: string
}

interface Prompt {
  id: string
  name: string
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  versions: Version[]
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  production: { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ADE80' },
  experimental: { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24' },
  deprecated: { bg: 'rgba(248, 113, 113, 0.1)', color: '#F87171' },
  draft: { bg: 'rgba(96, 165, 250, 0.1)', color: '#60A5FA' },
}

function getTagStyle(tag: string) {
  return TAG_COLORS[tag.toLowerCase()] ?? { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D' }
}

export default function PromptsClient({ initialPrompts }: { initialPrompts: Prompt[] }) {
  const [prompts, setPrompts] = useState(initialPrompts)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = prompts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const handleCreated = (prompt: Prompt) => {
    setPrompts(prev => [prompt, ...prev])
    setShowCreate(false)
  }

  return (
    <div className="flex-1 min-w-0" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b sticky top-0 z-10" style={{ borderColor: '#242424', background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(12px)' }}>
        <div>
          <h1 className="text-lg font-semibold text-white">Prompts</h1>
          <p className="text-xs mt-0.5" style={{ color: '#888' }}>{prompts.length} prompt{prompts.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
          style={{ background: '#F59E0B' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#D97706'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(245,158,11,0.35)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F59E0B'; (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New prompt
        </button>
      </div>

      <div className="px-8 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#888' }} fill="none" viewBox="0 0 16 16">
            <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search prompts by name or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-[#888] outline-none transition-colors"
            style={{ border: '1px solid #242424', background: '#111111' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#242424'; }}
          />
        </div>

        {/* Prompts grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="5" width="22" height="18" rx="3" stroke="#F59E0B" strokeWidth="1.8"/>
                <path d="M8 11h12M8 15h8" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2 text-lg">{search ? 'No prompts found' : 'No prompts yet'}</h3>
            <p className="text-sm mb-8 max-w-xs" style={{ color: '#888' }}>
              {search ? 'Try a different search term' : 'Create your first prompt to get started. Version-control your AI prompts like code.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: '#F59E0B' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Create your first prompt
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(prompt => (
              <Link
                key={prompt.id}
                href={`/dashboard/prompts/${prompt.id}`}
                className="block p-5 rounded-xl group transition-all"
                style={{ border: '1px solid #242424', background: '#111111' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = 'rgba(245,158,11,0.4)';
                  el.style.background = '#161616';
                  el.style.transform = 'translateY(-1px)';
                  el.style.boxShadow = '0 4px 20px rgba(245,158,11,0.08)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = '#242424';
                  el.style.background = '#111111';
                  el.style.transform = '';
                  el.style.boxShadow = '';
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-white truncate flex-1 text-sm">{prompt.name}</h3>
                  <span className="text-xs ml-2 shrink-0 font-mono px-1.5 py-0.5 rounded" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)' }}>
                    v{prompt.versions[0]?.version ?? 1}
                  </span>
                </div>

                {prompt.versions[0]?.content && (
                  <p className="text-xs font-mono mb-3 line-clamp-2 leading-relaxed" style={{ color: '#888' }}>
                    {prompt.versions[0].content}
                  </p>
                )}

                {prompt.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {prompt.tags.map(tag => {
                      const style = getTagStyle(tag)
                      return (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: style.bg, color: style.color }}>
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs" style={{ color: '#444' }}>
                    {new Date(prompt.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs flex items-center gap-1" style={{ color: '#444' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/>
                      <path d="M6 3.5v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                    {prompt.versions.length} version{prompt.versions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreatePromptModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
