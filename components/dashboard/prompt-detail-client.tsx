'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DiffViewer from './diff-viewer'

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

export default function PromptDetailClient({ prompt: initialPrompt }: { prompt: Prompt }) {
  const router = useRouter()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [activeVersion, setActiveVersion] = useState(prompt.versions[0])
  const [compareVersion, setCompareVersion] = useState<Version | null>(null)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(activeVersion?.content ?? '')
  const [commitMsg, setCommitMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tab, setTab] = useState<'content' | 'history' | 'diff'>('content')
  const [copied, setCopied] = useState(false)

  const handleSaveVersion = async () => {
    if (!editContent.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, message: commitMsg || undefined }),
      })
      if (!res.ok) throw new Error('Failed')
      const newVersion = await res.json()
      const updated = { ...newVersion, createdAt: newVersion.createdAt }
      setPrompt(prev => ({ ...prev, versions: [updated, ...prev.versions] }))
      setActiveVersion(updated)
      setEditing(false)
      setCommitMsg('')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this prompt and all its versions?')) return
    setDeleting(true)
    await fetch(`/api/prompts/${prompt.id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeVersion?.content ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 min-w-0" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="px-8 py-6 border-b sticky top-0 z-10" style={{ borderColor: '#242424', background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#888' }}>
              <a href="/dashboard" className="hover:text-white transition-colors">Prompts</a>
              <span style={{ color: '#444' }}>/</span>
              <span style={{ color: '#EDEDED' }}>{prompt.name}</span>
            </div>
            <h1 className="text-lg font-semibold text-white mb-2">{prompt.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {prompt.tags.map(tag => {
                const style = getTagStyle(tag)
                return (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: style.bg, color: style.color }}>
                    {tag}
                  </span>
                )
              })}
              <span className="text-xs" style={{ color: '#444' }}>{prompt.versions.length} version{prompt.versions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditing(true); setTab('content') }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ border: '1px solid #242424', background: '#161616' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#242424'; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              New version
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              style={{ border: '1px solid rgba(248,113,113,0.3)', color: '#F87171', background: 'rgba(248,113,113,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.06)'; }}
            >
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 -mb-px">
          {(['content', 'history', 'diff'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-sm capitalize transition-colors border-b-2 rounded-t-lg"
              style={tab === t ? {
                color: 'white',
                borderBottomColor: '#F59E0B',
                background: 'rgba(245,158,11,0.08)',
              } : {
                color: '#888',
                borderBottomColor: 'transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl">
        {/* Content tab */}
        {tab === 'content' && (
          <div className="space-y-4">
            {editing ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={18}
                  placeholder="Enter your prompt..."
                  className="w-full p-5 rounded-xl font-mono text-sm outline-none resize-y"
                  style={{ border: '1px solid #242424', background: '#111111', color: '#4ADE80', lineHeight: '1.7' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#242424'; }}
                />
                <div className="flex items-center gap-3">
                  <input
                    value={commitMsg}
                    onChange={e => setCommitMsg(e.target.value)}
                    placeholder="Describe what changed..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#888] outline-none"
                    style={{ border: '1px solid #242424', background: '#111111' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#242424'; }}
                  />
                  <button
                    onClick={handleSaveVersion}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: '#F59E0B' }}
                  >
                    {saving ? 'Saving...' : 'Save version'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEditContent(activeVersion?.content ?? '') }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: '#888', border: '1px solid #242424', background: 'transparent' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <select
                    value={activeVersion?.id}
                    onChange={e => {
                      const v = prompt.versions.find(v => v.id === e.target.value)
                      if (v) { setActiveVersion(v); setEditContent(v.content) }
                    }}
                    className="text-sm rounded-lg px-3 py-1.5 outline-none"
                    style={{ border: '1px solid #242424', background: '#161616', color: '#EDEDED' }}
                  >
                    {prompt.versions.map(v => (
                      <option key={v.id} value={v.id} style={{ background: '#161616' }}>
                        v{v.version} — {v.message ?? 'No message'} ({new Date(v.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ border: '1px solid #242424', color: copied ? '#4ADE80' : '#888', background: 'transparent' }}
                    >
                      {copied ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M8 4V2.5a.5.5 0 00-.5-.5h-6a.5.5 0 00-.5.5v6a.5.5 0 00.5.5H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setEditing(true); setEditContent(activeVersion?.content ?? '') }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ border: '1px solid #242424', color: '#888', background: 'transparent' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#EDEDED'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#242424'; (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <pre className="p-6 rounded-xl font-mono text-sm whitespace-pre-wrap leading-relaxed overflow-x-auto" style={{ border: '1px solid #242424', background: '#111111', color: '#4ADE80' }}>
                  {activeVersion?.content}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div className="space-y-2 relative">
            <div className="absolute left-[27px] top-8 bottom-4 w-px" style={{ background: 'linear-gradient(to bottom, #F59E0B, transparent)' }} />
            {prompt.versions.map((v, i) => (
              <div
                key={v.id}
                className="flex items-start gap-4 cursor-pointer group"
                onClick={() => { setActiveVersion(v); setEditContent(v.content) }}
              >
                {/* Dot */}
                <div className="relative z-10 w-4 h-4 rounded-full mt-4 shrink-0 flex items-center justify-center transition-all" style={{
                  background: activeVersion?.id === v.id ? '#F59E0B' : '#242424',
                  border: `2px solid ${activeVersion?.id === v.id ? '#F59E0B' : '#333'}`,
                  marginLeft: '20px',
                }} />
                <div
                  className="flex-1 p-4 rounded-xl transition-all"
                  style={{
                    border: `1px solid ${activeVersion?.id === v.id ? 'rgba(245,158,11,0.4)' : '#242424'}`,
                    background: activeVersion?.id === v.id ? 'rgba(245,158,11,0.06)' : '#111111',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.12)', color: '#FCD34D' }}>v{v.version}</span>
                      <span className="text-sm font-medium text-white">{v.message ?? 'No message'}</span>
                      {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>latest</span>}
                    </div>
                    <span className="text-xs" style={{ color: '#444' }}>{new Date(v.createdAt).toLocaleString()}</span>
                  </div>
                  {v.model && <div className="mt-1.5 text-xs" style={{ color: '#888' }}>Model: {v.model}</div>}
                  <p className="text-xs font-mono mt-2 line-clamp-2" style={{ color: '#888' }}>{v.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diff tab */}
        {tab === 'diff' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs mb-2 block" style={{ color: '#888' }}>Base version</label>
                <select
                  value={activeVersion?.id}
                  onChange={e => {
                    const v = prompt.versions.find(v => v.id === e.target.value)
                    if (v) setActiveVersion(v)
                  }}
                  className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                  style={{ border: '1px solid #242424', background: '#161616', color: '#EDEDED' }}
                >
                  {prompt.versions.map(v => (
                    <option key={v.id} value={v.id} style={{ background: '#161616' }}>v{v.version} — {v.message ?? 'No message'}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 text-lg" style={{ color: '#444' }}>→</div>
              <div className="flex-1">
                <label className="text-xs mb-2 block" style={{ color: '#888' }}>Compare with</label>
                <select
                  value={compareVersion?.id ?? ''}
                  onChange={e => {
                    const v = prompt.versions.find(v => v.id === e.target.value)
                    setCompareVersion(v ?? null)
                  }}
                  className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                  style={{ border: '1px solid #242424', background: '#161616', color: '#EDEDED' }}
                >
                  <option value="" style={{ background: '#161616' }}>Select version...</option>
                  {prompt.versions.filter(v => v.id !== activeVersion?.id).map(v => (
                    <option key={v.id} value={v.id} style={{ background: '#161616' }}>v{v.version} — {v.message ?? 'No message'}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeVersion && compareVersion ? (
              <DiffViewer oldText={activeVersion.content} newText={compareVersion.content} />
            ) : (
              <div className="text-center py-16 rounded-xl" style={{ border: '1px solid #242424', background: '#111111' }}>
                <div className="text-3xl mb-3">↔</div>
                <p className="text-sm" style={{ color: '#888' }}>Select two versions to compare</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
