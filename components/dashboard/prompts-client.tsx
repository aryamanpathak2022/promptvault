'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Prompts</h1>
          <p className="text-sm text-white/40 mt-1">{prompts.length} prompt{prompts.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          + New prompt
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search prompts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Prompts grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-white font-medium mb-2">{search ? 'No prompts found' : 'No prompts yet'}</h3>
          <p className="text-white/40 text-sm mb-6">
            {search ? 'Try a different search' : 'Create your first prompt to get started'}
          </p>
          {!search && (
            <Button onClick={() => setShowCreate(true)}>Create your first prompt</Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(prompt => (
            <Link
              key={prompt.id}
              href={`/dashboard/prompts/${prompt.id}`}
              className="block p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-white group-hover:text-white truncate flex-1">{prompt.name}</h3>
                <span className="text-xs text-white/30 ml-2 shrink-0">v{prompt.versions[0]?.version ?? 1}</span>
              </div>

              {prompt.versions[0] && (
                <p className="text-sm text-white/40 line-clamp-2 font-mono mb-3">
                  {prompt.versions[0].content}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {prompt.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="mt-3 text-xs text-white/25">
                Updated {new Date(prompt.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePromptModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
