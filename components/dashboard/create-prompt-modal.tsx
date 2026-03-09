'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  onClose: () => void
  onCreated: (prompt: any) => void
}

export default function CreatePromptModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [message, setMessage] = useState('Initial version')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) {
      setError('Name and content are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          content: content.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          message: message.trim() || 'Initial version',
        }),
      })
      if (!res.ok) throw new Error('Failed to create prompt')
      const prompt = await res.json()
      onCreated({
        ...prompt,
        tags: JSON.parse(prompt.tags || '[]'),
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
        versions: prompt.versions?.map((v: any) => ({ ...v, createdAt: v.createdAt })) ?? [],
      })
    } catch (e) {
      setError('Failed to create prompt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-[#111] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">New prompt</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. code-reviewer, email-drafter"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Prompt content</label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="You are an expert..."
              rows={8}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Tags (comma separated)</label>
              <Input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="production, gpt-4"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Commit message</label>
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Initial version"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create prompt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
