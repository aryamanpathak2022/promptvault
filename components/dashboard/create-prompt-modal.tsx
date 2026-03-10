'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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
  latestVersion: VersionSummary | null
}

interface Props {
  onClose: () => void
  onCreated: (prompt: PromptSummary) => void
}

export default function CreatePromptModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [message, setMessage] = useState('Initial version')
  const [model, setModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !content.trim()) {
      setError('Name and content are required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          content: content.trim(),
          tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          message: message.trim(),
          model: model.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Failed to create prompt.')

      onCreated(data)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to create prompt.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-[28px] border border-[#262626] bg-[#0d0d0d] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">New prompt</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-50">Create a prompt with its first version</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Add the prompt body now, then keep iterating from the detail page.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-[#2a2a2a] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-[#F59E0B]/40 hover:text-zinc-100"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Prompt name
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="code-reviewer"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Model tag
              </label>
              <Input
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="gpt-4.1 / claude-3.7"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Prompt content
            </label>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="You are an expert prompt optimizer..."
              rows={12}
              className="font-mono leading-6"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Commit message
              </label>
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Initial version"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Tags
              </label>
              <Input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="production, support, prompt"
              />
            </div>
          </div>

          {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-[#1d1d1d] pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating prompt...' : 'Create prompt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
