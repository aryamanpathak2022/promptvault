'use client'

import { useState } from 'react'

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
}

export default function SettingsClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const data = await res.json()
      setNewKey(data.key)
      setKeys(prev => [{ id: data.id, name: data.name, key: data.key.slice(0, 8) + '...' + data.key.slice(-4), createdAt: data.createdAt, lastUsed: null }, ...prev])
      setNewKeyName('')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return
    await fetch('/api/keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setKeys(prev => prev.filter(k => k.id !== id))
  }

  const copyKey = (text: string, id?: string) => {
    navigator.clipboard.writeText(text)
    if (id) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex-1 min-w-0" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="px-8 py-6 border-b sticky top-0 z-10" style={{ borderColor: '#242424', background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(12px)' }}>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: '#888' }}>Manage your API keys and CLI access</p>
      </div>

      <div className="px-8 py-6 max-w-3xl space-y-6">
        {/* New key revealed */}
        {newKey && (
          <div className="p-5 rounded-xl" style={{ border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.05)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium" style={{ color: '#4ADE80' }}>✓ API key created</p>
                <p className="text-xs mt-1" style={{ color: '#888' }}>Save this key now — you won&apos;t see it again.</p>
              </div>
              <button onClick={() => setNewKey(null)} className="text-xl leading-none transition-colors" style={{ color: '#888' }}>×</button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-xl text-xs font-mono break-all" style={{ background: '#111111', border: '1px solid #242424', color: '#4ADE80' }}>{newKey}</code>
              <button
                onClick={() => copyKey(newKey)}
                className="px-3 py-3 rounded-xl text-xs font-medium shrink-0 transition-all"
                style={{ border: '1px solid #242424', color: copied ? '#4ADE80' : '#888', background: '#161616' }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Create key */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#242424', background: '#111111' }}>
            <h2 className="font-semibold text-white text-sm">Create API key</h2>
            <p className="text-xs mt-1" style={{ color: '#888' }}>API keys allow CLI and programmatic access to your vault.</p>
          </div>
          <div className="px-6 py-5" style={{ background: '#0d0d0d' }}>
            <div className="flex items-center gap-3">
              <input
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. laptop, CI/CD)"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#888] outline-none"
                style={{ border: '1px solid #242424', background: '#111111' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#242424'; }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newKeyName.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-all shrink-0"
                style={{ background: '#F59E0B' }}
                onMouseEnter={e => { if (!creating && newKeyName.trim()) (e.currentTarget as HTMLButtonElement).style.background = '#D97706'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F59E0B'; }}
              >
                {creating ? 'Creating...' : 'Create key'}
              </button>
            </div>
          </div>
        </div>

        {/* Keys list */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#242424', background: '#111111' }}>
            <h2 className="font-semibold text-white text-sm">Your API keys</h2>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              Use with the CLI: <code className="font-mono px-1.5 py-0.5 rounded" style={{ background: '#161616', color: '#FCD34D' }}>PROMPTVAULT_API_KEY=pv_...</code>
            </p>
          </div>
          <div style={{ background: '#0d0d0d' }}>
            {keys.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm" style={{ color: '#888' }}>No API keys yet</div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#242424' }}>
                {keys.map(key => (
                  <div key={key.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} />
                        <span className="text-sm font-medium text-white">{key.name}</span>
                      </div>
                      <code className="text-xs font-mono" style={{ color: '#888' }}>{key.key}</code>
                      <div className="text-xs mt-1" style={{ color: '#444' }}>
                        Created {new Date(key.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {key.lastUsed && ` · Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyKey(key.key, key.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ border: '1px solid #242424', color: copiedId === key.id ? '#4ADE80' : '#888', background: 'transparent' }}
                      >
                        {copiedId === key.id ? '✓' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ border: '1px solid rgba(248,113,113,0.3)', color: '#F87171', background: 'rgba(248,113,113,0.06)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.12)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.06)'; }}
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CLI Usage */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#242424', background: '#111111' }}>
            <h2 className="font-semibold text-white text-sm">CLI Usage</h2>
            <p className="text-xs mt-1" style={{ color: '#888' }}>Install and configure the PromptVault CLI</p>
          </div>
          <div className="px-6 py-5" style={{ background: '#0d0d0d' }}>
            <pre className="p-5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed" style={{ border: '1px solid #242424', background: '#111111', color: '#4ADE80' }}>{`# Install
npm install -g pvault

# Set your API key
export PROMPTVAULT_API_KEY=pv_your_key_here

# Save a prompt from file
pv save "code-reviewer" --file ./prompt.txt

# Or save from stdin
echo "Your prompt text" | pv save "my-prompt"

# List all prompts
pv list

# Diff two versions
pv diff code-reviewer v1 v2

# Load a prompt
pv load "code-reviewer"

# MCP server (for Claude/Cursor)
pv mcp-server`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
