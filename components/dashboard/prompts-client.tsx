'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import CreatePromptModal from './create-prompt-modal'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'

interface VersionSummary {
  id: string
  content: string
  version: number
  message: string | null
  model: string | null
  createdAt: string
}

interface PromptSummary {
  id: string
  name: string
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  versionCount: number
  searchableText: string
  latestVersion: VersionSummary | null
}

function versionMeta(version: VersionSummary | null) {
  if (!version) return 'No versions yet. Save your first version above.'
  return `v${version.version} · ${formatRelativeTime(version.createdAt)} · ${version.message ?? 'No commit message'}`
}

export default function PromptsClient({ initialPrompts }: { initialPrompts: PromptSummary[] }) {
  const [prompts, setPrompts] = useState(initialPrompts)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const allTags = useMemo(() => {
    return Array.from(new Set(prompts.flatMap((prompt) => prompt.tags))).sort((a, b) => a.localeCompare(b))
  }, [prompts])

  const filteredPrompts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return prompts.filter((prompt) => {
      const matchesSearch =
        !query ||
        prompt.name.toLowerCase().includes(query) ||
        prompt.searchableText.toLowerCase().includes(query) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesTag = tagFilter === 'all' || prompt.tags.includes(tagFilter)
      return matchesSearch && matchesTag
    })
  }, [prompts, search, tagFilter])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleCreated = (prompt: PromptSummary) => {
    setPrompts((current) => [prompt, ...current])
    setShowCreate(false)
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="border-b border-[#171717] bg-[#0c0c0c] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Dashboard</p>
            <h1 className="mt-1.5 text-xl font-semibold text-zinc-50">Your prompt library</h1>
            <p className="mt-1 text-sm text-zinc-500">Search by name, tag, or content. Keep only what still works.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/explore"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#222222] bg-[#101010] px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-[#131313] hover:text-zinc-50"
            >
              Explore
            </Link>
            <Button onClick={() => setShowCreate(true)} className="h-10 gap-2 rounded-lg px-3">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              New prompt
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-6">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Prompts</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-50">{prompts.length}</p>
          </div>
          <div className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Versions</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-50">
              {prompts.reduce((sum, prompt) => sum + prompt.versionCount, 0)}
            </p>
          </div>
          <div className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Public</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-50">
              {prompts.filter((prompt) => prompt.isPublic).length}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block max-w-xl flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search prompts or content"
              className="h-10 w-full rounded-lg border border-[#222222] bg-[#101010] pl-10 pr-16 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#F59E0B]/70 focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600">⌘K</span>
          </label>
          <select
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            className="h-10 rounded-lg border border-[#222222] bg-[#101010] px-3 text-sm text-zinc-100 focus:border-[#F59E0B]/70 focus:outline-none"
          >
            <option value="all">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {filteredPrompts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#222222] bg-[#0f0f0f] px-5 py-10 text-center">
            <h2 className="text-base font-medium text-zinc-50">
              {search || tagFilter !== 'all' ? 'Nothing matches those filters.' : 'No prompts yet. Create your first one to start versioning.'}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {search || tagFilter !== 'all'
                ? 'Try another term or clear the tag filter.'
                : 'Keep your working prompts close and your experiments traceable.'}
            </p>
            {!search && tagFilter === 'all' && (
              <Button onClick={() => setShowCreate(true)} className="mt-4 h-9 rounded-lg px-3">
                Create prompt
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/dashboard/prompts/${prompt.id}`}
                className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4 transition-colors hover:border-[#2f2413] hover:bg-[#121212]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-50">{prompt.name}</p>
                      {prompt.isPublic && (
                        <span className="rounded-full border border-[#2f2413] bg-[#15120d] px-2 py-0.5 text-[10px] font-medium text-[#F59E0B]">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-[12px] text-zinc-500">{versionMeta(prompt.latestVersion)}</p>
                  </div>
                  <span className="rounded-full border border-[#1f1f1f] bg-[#0b0b0b] px-2 py-0.5 text-[11px] text-zinc-400">
                    {prompt.versionCount}
                  </span>
                </div>

                {prompt.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#222222] px-2 py-0.5 text-[11px] text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 rounded-lg border border-[#181818] bg-[#0b0b0b] p-3">
                  <p className="line-clamp-4 whitespace-pre-wrap font-mono text-[12px] leading-5 text-zinc-400">
                    {prompt.latestVersion?.content ?? 'No versions yet. Save your first version above.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreatePromptModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  )
}
