'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-white/40 mb-2">
            <a href="/dashboard" className="hover:text-white transition-colors">Prompts</a>
            <span>/</span>
            <span className="text-white/70">{prompt.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{prompt.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {prompt.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            <span className="text-xs text-white/30">{prompt.versions.length} version{prompt.versions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditing(true); setTab('content') }}>
            + New version
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? '...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/10 pb-0">
        {(['content', 'history', 'diff'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'text-white border-white'
                : 'text-white/40 border-transparent hover:text-white/70'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {tab === 'content' && (
        <div className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={16}
                className="font-mono text-sm"
                placeholder="Enter your prompt..."
              />
              <div className="flex items-center gap-3">
                <Input
                  value={commitMsg}
                  onChange={e => setCommitMsg(e.target.value)}
                  placeholder="Describe what changed..."
                  className="flex-1"
                />
                <Button onClick={handleSaveVersion} disabled={saving}>
                  {saving ? 'Saving...' : 'Save version'}
                </Button>
                <Button variant="ghost" onClick={() => { setEditing(false); setEditContent(activeVersion?.content ?? '') }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <select
                    value={activeVersion?.id}
                    onChange={e => {
                      const v = prompt.versions.find(v => v.id === e.target.value)
                      if (v) { setActiveVersion(v); setEditContent(v.content) }
                    }}
                    className="text-sm rounded-lg border border-white/10 bg-white/5 text-white px-3 py-1.5 focus:outline-none"
                  >
                    {prompt.versions.map(v => (
                      <option key={v.id} value={v.id} className="bg-[#111]">
                        v{v.version} — {v.message ?? 'No message'} ({new Date(v.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditing(true); setEditContent(activeVersion?.content ?? '') }}>
                  Edit
                </Button>
              </div>
              <pre className="p-5 rounded-xl border border-white/10 bg-black/40 text-sm text-white/80 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {activeVersion?.content}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          {prompt.versions.map((v, i) => (
            <div
              key={v.id}
              className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                activeVersion?.id === v.id
                  ? 'border-white/20 bg-white/8'
                  : 'border-white/10 bg-white/5 hover:bg-white/8'
              }`}
              onClick={() => { setActiveVersion(v); setEditContent(v.content) }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/40 bg-white/10 px-2 py-0.5 rounded">v{v.version}</span>
                  <span className="text-sm text-white">{v.message ?? 'No message'}</span>
                  {i === 0 && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">latest</span>}
                </div>
                <span className="text-xs text-white/30">{new Date(v.createdAt).toLocaleString()}</span>
              </div>
              {v.model && <div className="mt-1 text-xs text-white/30">Model: {v.model}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Diff tab */}
      {tab === 'diff' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">Base version</label>
              <select
                value={activeVersion?.id}
                onChange={e => {
                  const v = prompt.versions.find(v => v.id === e.target.value)
                  if (v) setActiveVersion(v)
                }}
                className="w-full text-sm rounded-lg border border-white/10 bg-white/5 text-white px-3 py-1.5 focus:outline-none"
              >
                {prompt.versions.map(v => (
                  <option key={v.id} value={v.id} className="bg-[#111]">v{v.version} — {v.message ?? 'No message'}</option>
                ))}
              </select>
            </div>
            <div className="text-white/30 mt-5">→</div>
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">Compare with</label>
              <select
                value={compareVersion?.id ?? ''}
                onChange={e => {
                  const v = prompt.versions.find(v => v.id === e.target.value)
                  setCompareVersion(v ?? null)
                }}
                className="w-full text-sm rounded-lg border border-white/10 bg-white/5 text-white px-3 py-1.5 focus:outline-none"
              >
                <option value="" className="bg-[#111]">Select version...</option>
                {prompt.versions.filter(v => v.id !== activeVersion?.id).map(v => (
                  <option key={v.id} value={v.id} className="bg-[#111]">v{v.version} — {v.message ?? 'No message'}</option>
                ))}
              </select>
            </div>
          </div>

          {activeVersion && compareVersion ? (
            <DiffViewer oldText={activeVersion.content} newText={compareVersion.content} />
          ) : (
            <div className="text-center py-12 text-white/30 text-sm">
              Select two versions to compare
            </div>
          )}
        </div>
      )}
    </div>
  )
}
