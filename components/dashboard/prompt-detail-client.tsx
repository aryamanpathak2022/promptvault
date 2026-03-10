'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import DiffViewer from './diff-viewer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

function formatTimestamp(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default function PromptDetailClient({ prompt: initialPrompt }: { prompt: Prompt }) {
  const router = useRouter()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [selectedVersionId, setSelectedVersionId] = useState(initialPrompt.versions[0]?.id ?? '')
  const [compareVersionId, setCompareVersionId] = useState(initialPrompt.versions[1]?.id ?? initialPrompt.versions[0]?.id ?? '')
  const [draftContent, setDraftContent] = useState(initialPrompt.versions[0]?.content ?? '')
  const [commitMessage, setCommitMessage] = useState('')
  const [modelTag, setModelTag] = useState(initialPrompt.versions[0]?.model ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const selectedVersion = useMemo(
    () => prompt.versions.find((version) => version.id === selectedVersionId) ?? prompt.versions[0],
    [prompt.versions, selectedVersionId]
  )
  const compareVersion = useMemo(
    () => prompt.versions.find((version) => version.id === compareVersionId) ?? null,
    [compareVersionId, prompt.versions]
  )

  const handleCopy = async () => {
    if (!selectedVersion) return
    await navigator.clipboard.writeText(selectedVersion.content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

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
      <div className="border-b border-[#1d1d1d] bg-[#0c0c0c]/90 px-5 py-5 backdrop-blur md:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Link href="/dashboard" className="transition-colors hover:text-zinc-200">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-zinc-300">{prompt.name}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-zinc-50">{prompt.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{prompt.versions.length} versions</span>
              <span className="text-zinc-600">•</span>
              <span>Updated {formatTimestamp(prompt.updatedAt)}</span>
              {prompt.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#2a2a2a] bg-[#141414] px-2.5 py-1 text-xs text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadSelectedIntoDraft}>
              Use selected as base
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete prompt'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-6 md:px-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Timeline</p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-50">All versions</h2>
              </div>
              <div className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-1 text-xs text-[#f8c86f]">
                {prompt.versions.length}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {prompt.versions.map((version, index) => {
                const active = version.id === selectedVersion?.id
                return (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersionId(version.id)}
                    className={
                      active
                        ? 'relative w-full rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-left'
                        : 'relative w-full rounded-2xl border border-[#222222] bg-[#121212] p-4 text-left transition-colors hover:border-[#F59E0B]/20 hover:bg-[#151515]'
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#F59E0B]/20 bg-[#0b0b0b] px-2.5 py-1 font-mono text-xs text-[#f8c86f]">
                        v{version.version}
                      </span>
                      {index === 0 && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
                          latest
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-medium text-zinc-100">
                      {version.message || 'No commit message'}
                    </p>
                    <p className="mt-2 line-clamp-2 whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-500">
                      {version.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span>{formatTimestamp(version.createdAt)}</span>
                      {version.model && <span className="rounded-full border border-[#2a2a2a] px-2 py-0.5 text-zinc-400">{version.model}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Selected version</p>
                {selectedVersion ? (
                  <>
                    <h2 className="mt-2 text-xl font-semibold text-zinc-50">Version {selectedVersion.version}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {selectedVersion.message || 'No commit message'}
                    </p>
                  </>
                ) : (
                  <h2 className="mt-2 text-xl font-semibold text-zinc-50">No version selected</h2>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {selectedVersion?.model && (
                  <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-1 text-xs text-[#f8c86f]">
                    {selectedVersion.model}
                  </span>
                )}
                <Button variant="outline" onClick={handleCopy} disabled={!selectedVersion}>
                  {copied ? 'Copied' : 'Copy content'}
                </Button>
              </div>
            </div>
            <div className="mt-5 rounded-3xl border border-[#1f1f1f] bg-[#0b0b0b] p-4 md:p-5">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-zinc-200">
                {selectedVersion?.content ?? 'Select a version from the timeline.'}
              </pre>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Create version</p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-50">Save the next iteration</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Draft a new version, tag the model, and leave a commit note for future diffs.
                </p>
              </div>
              <div className="rounded-full border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-1 text-xs text-zinc-400">
                Next version: v{(prompt.versions[0]?.version ?? 0) + 1}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Textarea
                value={draftContent}
                onChange={(event) => setDraftContent(event.target.value)}
                rows={14}
                className="font-mono leading-6"
                placeholder="Refine your prompt here..."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Commit message
                  </label>
                  <Input
                    value={commitMessage}
                    onChange={(event) => setCommitMessage(event.target.value)}
                    placeholder="Improve fallback instructions"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Model tag
                  </label>
                  <Input
                    value={modelTag}
                    onChange={(event) => setModelTag(event.target.value)}
                    placeholder="claude-3.7-sonnet"
                  />
                </div>
              </div>
              {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={loadSelectedIntoDraft}>
                  Load selected version
                </Button>
                <Button onClick={handleCreateVersion} disabled={saving}>
                  {saving ? 'Saving version...' : 'Save version'}
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 md:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Diff viewer</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-50">Compare prompt revisions</h2>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Base version
                </label>
                <select
                  value={selectedVersion?.id ?? ''}
                  onChange={(event) => setSelectedVersionId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111111] px-3 text-sm text-zinc-100 focus:border-[#F59E0B]/60 focus:outline-none"
                >
                  {prompt.versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      v{version.version} - {version.message || 'No commit message'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pb-3 text-center text-zinc-600">vs</div>
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Compare with
                </label>
                <select
                  value={compareVersion?.id ?? ''}
                  onChange={(event) => setCompareVersionId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111111] px-3 text-sm text-zinc-100 focus:border-[#F59E0B]/60 focus:outline-none"
                >
                  {prompt.versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      v{version.version} - {version.message || 'No commit message'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              {selectedVersion && compareVersion ? (
                <DiffViewer oldText={selectedVersion.content} newText={compareVersion.content} />
              ) : (
                <div className="rounded-3xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-6 py-12 text-center text-sm text-zinc-500">
                  Pick two versions to compare their prompt content.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
