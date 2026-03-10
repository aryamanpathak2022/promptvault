'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import DiffViewer from './diff-viewer'
import { Button } from '@/components/ui/button'
import CopyButton from '@/components/ui/copy-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { estimateTokens, formatRelativeTime } from '@/lib/format'

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

function versionLabel(version: Version) {
  return `v${version.version} · ${formatRelativeTime(version.createdAt)} · ${version.message ?? 'No commit message'}`
}

export default function PromptDetailClient({ prompt: initialPrompt }: { prompt: Prompt }) {
  const router = useRouter()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [selectedVersionId, setSelectedVersionId] = useState(initialPrompt.versions[0]?.id ?? '')
  const [compareVersionId, setCompareVersionId] = useState(initialPrompt.versions[1]?.id ?? initialPrompt.versions[0]?.id ?? '')
  const [draftContent, setDraftContent] = useState(initialPrompt.versions[0]?.content ?? '')
  const [commitMessage, setCommitMessage] = useState('')
  const [modelTag, setModelTag] = useState(initialPrompt.versions[0]?.model ?? '')
  const [isPublic, setIsPublic] = useState(initialPrompt.isPublic)
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const selectedVersion = useMemo(
    () => prompt.versions.find((version) => version.id === selectedVersionId) ?? prompt.versions[0],
    [prompt.versions, selectedVersionId]
  )
  const compareVersion = useMemo(
    () => prompt.versions.find((version) => version.id === compareVersionId) ?? null,
    [compareVersionId, prompt.versions]
  )

  const publicUrl = typeof window === 'undefined' ? `/p/${prompt.id}` : `${window.location.origin}/p/${prompt.id}`
  const charCount = draftContent.length
  const tokenCount = estimateTokens(draftContent)

  const handleCreateVersion = async () => {
    if (!draftContent.trim()) {
      setError('Version content is required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/prompts/${prompt.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: draftContent,
          message: commitMessage,
          model: modelTag,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Failed to create version.')

      setPrompt((current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        versions: [data, ...current.versions],
      }))
      setSelectedVersionId(data.id)
      setCompareVersionId(selectedVersion?.id ?? data.id)
      setCommitMessage('')
      setModelTag(data.model ?? '')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to create version.')
    } finally {
      setSaving(false)
    }
  }

          useEffect(() => {
            const onKeyDown = (event: KeyboardEvent) => {
              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
                event.preventDefault()
                void handleCreateVersion()
              }
            }

            window.addEventListener('keydown', onKeyDown)
            return () => window.removeEventListener('keydown', onKeyDown)
          }, [draftContent, commitMessage, modelTag, prompt.id, selectedVersion])

  const handleTogglePublic = async () => {
    setSharing(true)
    setError('')

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Failed to update sharing.')

      setPrompt(data)
      setIsPublic(data.isPublic)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to update sharing.')
    } finally {
      setSharing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this prompt and all of its versions?')) return
    setDeleting(true)

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete prompt.')
      router.push('/dashboard')
    } finally {
      setDeleting(false)
    }
  }

  const loadSelectedIntoDraft = () => {
    if (!selectedVersion) return
    setDraftContent(selectedVersion.content)
    setModelTag(selectedVersion.model ?? '')
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="border-b border-[#171717] bg-[#0c0c0c] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <Link href="/dashboard" className="transition-colors hover:text-zinc-200">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-zinc-300">{prompt.name}</span>
            </div>
            <h1 className="mt-1.5 text-xl font-semibold text-zinc-50">{prompt.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <span>{prompt.versions.length} versions</span>
              <span>·</span>
              <span>{formatRelativeTime(prompt.updatedAt)}</span>
              {prompt.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#222222] px-2 py-0.5 text-[11px] text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadSelectedIntoDraft} className="h-9 rounded-lg px-3">
              Use selected
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="h-9 rounded-lg px-3">
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 md:px-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Timeline</p>
                <h2 className="mt-1 text-sm font-semibold text-zinc-50">Versions</h2>
              </div>
              <div className="rounded-full border border-[#1f1f1f] bg-[#0b0b0b] px-2 py-0.5 text-[11px] text-zinc-400">
                {prompt.versions.length}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {prompt.versions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#222222] bg-[#0d0d0d] px-3 py-5 text-sm text-zinc-500">
                  No versions yet. Save your first version above.
                </div>
              ) : (
                prompt.versions.map((version, index) => {
                  const active = version.id === selectedVersion?.id
                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'rounded-lg border p-3',
                        active ? 'border-[#2f2413] bg-[#15120d]' : 'border-[#1f1f1f] bg-[#111111]'
                      )}
                    >
                      <button onClick={() => setSelectedVersionId(version.id)} className="w-full text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono text-[12px] text-zinc-400">{versionLabel(version)}</p>
                          {index === 0 && <span className="text-[10px] text-zinc-600">latest</span>}
                        </div>
                        <p className="mt-1 text-sm text-zinc-100">{version.message ?? 'No commit message'}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                          {version.model && <span className="rounded-full border border-[#222222] px-2 py-0.5 text-zinc-400">{version.model}</span>}
                        </div>
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="line-clamp-2 whitespace-pre-wrap font-mono text-[12px] leading-5 text-zinc-500">
                          {version.content}
                        </p>
                        <CopyButton value={version.content} label="Copy" copiedLabel="Copied" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <section className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Sharing</p>
                <h2 className="mt-1 text-sm font-semibold text-zinc-50">Public read-only link</h2>
                <p className="mt-1 text-sm text-zinc-500">Only enable this when you want others to inspect the prompt and copy versions.</p>
              </div>
              <button
                type="button"
                onClick={handleTogglePublic}
                disabled={sharing}
                className={`relative h-7 w-12 rounded-full transition-colors ${isPublic ? 'bg-[#F59E0B]' : 'bg-[#27272a]'}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[#1f1f1f] bg-[#0b0b0b] p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-100">{isPublic ? 'Public link enabled' : 'Private only'}</p>
                <p className="mt-1 text-sm text-zinc-500">{isPublic ? publicUrl : 'Turn on public sharing to generate a read-only URL.'}</p>
              </div>
                      {isPublic && <CopyButton value={publicUrl} label="Copy share URL" copiedLabel="Copied" />}
            </div>
          </section>

          <section className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Selected version</p>
                {selectedVersion ? (
                  <>
                    <p className="mt-1 font-mono text-[12px] text-zinc-400">{versionLabel(selectedVersion)}</p>
                    <p className="mt-1 text-sm text-zinc-100">{selectedVersion.message ?? 'No commit message'}</p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-zinc-500">No versions yet. Save your first version above.</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedVersion?.model && <span className="rounded-full border border-[#222222] px-2 py-0.5 text-[11px] text-zinc-400">{selectedVersion.model}</span>}
                {selectedVersion && <CopyButton value={selectedVersion.content} label="Copy content" copiedLabel="Copied" />}
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-[#1f1f1f] bg-[#0b0b0b] p-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-zinc-200">
                {selectedVersion?.content ?? 'No versions yet. Save your first version above.'}
              </pre>
            </div>
          </section>

          <section className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Create version</p>
                <h2 className="mt-1 text-sm font-semibold text-zinc-50">Save the next revision</h2>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                <span>⌘S</span>
                <span>save</span>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <div className="relative">
                <Textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  rows={14}
                  className="min-h-[280px] rounded-lg border-[#222222] bg-[#0b0b0b] pb-10 font-mono text-[13px] leading-6"
                  placeholder="Write the next revision here..."
                />
                <div className="pointer-events-none absolute bottom-3 right-3 text-[11px] text-zinc-600">
                  {charCount} chars · ~{tokenCount} tokens
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-zinc-500">Commit message</label>
                  <Input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} placeholder="Refined fallback tone" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-zinc-500">Model tag</label>
                  <Input value={modelTag} onChange={(event) => setModelTag(event.target.value)} placeholder="claude-3.7-sonnet" />
                </div>
              </div>
              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={loadSelectedIntoDraft} className="h-9 rounded-lg px-3">
                  Load selected
                  <span className="ml-2 text-[11px] text-zinc-500">base</span>
                </Button>
                <Button onClick={handleCreateVersion} disabled={saving} className="h-9 rounded-lg px-3">
                  {saving ? 'Saving...' : 'Save version'}
                  <span className="ml-2 text-[11px] text-[#7c5a12]">⌘S</span>
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Diff</p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">Compare any two versions</h2>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-zinc-500">Base</label>
                <select
                  value={selectedVersion?.id ?? ''}
                  onChange={(event) => setSelectedVersionId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#222222] bg-[#0b0b0b] px-3 text-sm text-zinc-100 focus:border-[#F59E0B]/70 focus:outline-none"
                >
                  {prompt.versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {versionLabel(version)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pb-2 text-center text-zinc-600">vs</div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-zinc-500">Compare</label>
                <select
                  value={compareVersion?.id ?? ''}
                  onChange={(event) => setCompareVersionId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#222222] bg-[#0b0b0b] px-3 text-sm text-zinc-100 focus:border-[#F59E0B]/70 focus:outline-none"
                >
                  {prompt.versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {versionLabel(version)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              {selectedVersion && compareVersion ? (
                <DiffViewer oldText={selectedVersion.content} newText={compareVersion.content} />
              ) : (
                <div className="rounded-lg border border-dashed border-[#222222] bg-[#0d0d0d] px-4 py-8 text-center text-sm text-zinc-500">
                  No versions yet. Save your first version above.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
