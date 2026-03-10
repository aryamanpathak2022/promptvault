'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import CreatePromptModal from './create-prompt-modal'
import { Button } from '@/components/ui/button'

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

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

export default function PromptsClient({ initialPrompts }: { initialPrompts: PromptSummary[] }) {
  const [prompts, setPrompts] = useState(initialPrompts)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

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

  const handleCreated = (prompt: PromptSummary) => {
    setPrompts((current) => [prompt, ...current])
    setShowCreate(false)
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="border-b border-[#1d1d1d] bg-[#0c0c0c]/90 px-5 py-5 backdrop-blur md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Your prompt library</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Browse prompts, filter by tag, and search across names and version content in real time.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/explore"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 text-sm font-medium text-zinc-200 transition-colors hover:border-[#F59E0B]/40 hover:text-zinc-50"
            >
              Explore public prompts
            </Link>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              New prompt
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 md:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total prompts</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-50">{prompts.length}</p>
          </div>
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total versions</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-50">
              {prompts.reduce((sum, prompt) => sum + prompt.versionCount, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Public prompts</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-50">
              {prompts.filter((prompt) => prompt.isPublic).length}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block max-w-xl flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by prompt name, tag, or content"
              className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111111] pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#F59E0B]/60 focus:outline-none"
            />
          </label>
          <select
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            className="h-11 rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 text-sm text-zinc-100 focus:border-[#F59E0B]/60 focus:outline-none"
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
          <div className="rounded-3xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="5" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 11h10M9 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-zinc-50">
              {search || tagFilter !== 'all' ? 'No prompts match your filters' : 'Create your first prompt'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              {search || tagFilter !== 'all'
                ? 'Try a different search term or tag filter.'
                : 'PromptVault keeps every revision organized so you can diff, copy, and ship prompts with confidence.'}
            </p>
            {!search && tagFilter === 'all' && (
              <Button onClick={() => setShowCreate(true)} className="mt-6 gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Create prompt
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/dashboard/prompts/${prompt.id}`}
                className="group rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#F59E0B]/35 hover:bg-[#131313]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-zinc-50">{prompt.name}</p>
                      {prompt.isPublic && (
                        <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-1 text-[11px] font-medium text-[#f8c86f]">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">Updated {formatDate(prompt.updatedAt)}</p>
                  </div>
                  <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-medium text-[#f8c86f]">
                    {prompt.versionCount} version{prompt.versionCount === 1 ? '' : 's'}
                  </span>
                </div>

                {prompt.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#2a2a2a] bg-[#151515] px-2.5 py-1 text-xs text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-[#1f1f1f] bg-[#0b0b0b] p-4">
                  <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                    <span>{prompt.latestVersion ? `v${prompt.latestVersion.version}` : 'No versions'}</span>
                    <span>{prompt.latestVersion?.model ?? 'No model tag'}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-400">
                    {prompt.latestVersion?.content ?? 'Create your first version to start versioning this prompt.'}
                  </p>
                  <p className="mt-3 text-sm text-zinc-200">
                    {prompt.latestVersion?.message ?? 'Initial version ready to iterate'}
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
