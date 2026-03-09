'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-1">Manage your API keys for CLI access</p>
      </div>

      {/* New key revealed */}
      {newKey && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-emerald-400">✓ API key created</p>
              <p className="text-xs text-white/50 mt-1">Save this key now — you won&apos;t see it again.</p>
            </div>
            <button onClick={() => setNewKey(null)} className="text-white/30 hover:text-white text-xl leading-none">×</button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <code className="flex-1 p-2 rounded-lg bg-black/40 text-xs text-emerald-300 font-mono break-all">{newKey}</code>
            <Button size="sm" variant="secondary" onClick={copyKey}>
              {copied ? '✓' : 'Copy'}
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create API key</CardTitle>
          <CardDescription>API keys allow CLI and programmatic access to your vault.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. laptop, CI)"
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
              {creating ? 'Creating...' : 'Create key'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your API keys</CardTitle>
          <CardDescription>
            Use these with the CLI: <code className="text-white/70">pv --api-key YOUR_KEY</code> or set <code className="text-white/70">PROMPTVAULT_API_KEY</code> env var.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">No API keys yet</p>
          ) : (
            <div className="space-y-3">
              {keys.map(key => (
                <div key={key.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <div className="text-sm font-medium text-white">{key.name}</div>
                    <div className="text-xs text-white/30 font-mono mt-0.5">{key.key}</div>
                    <div className="text-xs text-white/20 mt-1">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && ` · Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(key.id)}>
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CLI Usage</CardTitle>
          <CardDescription>Install and configure the PromptVault CLI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="p-4 rounded-lg bg-black/40 text-sm text-white/70 font-mono overflow-x-auto">{`# Install
npm install -g promptvault

# Configure with your API key
pv config set api-key YOUR_API_KEY
pv config set api-url http://localhost:3000

# Save a prompt
pv save "my-prompt"

# List prompts
pv list

# Show diff
pv diff my-prompt v1 v2`}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
