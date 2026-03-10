'use client'

        import { useState } from 'react'
        import { Button } from '@/components/ui/button'
        import { Input } from '@/components/ui/input'

        interface ApiKey {
          id: string
          name: string
          key: string
          createdAt: string
          lastUsed: string | null
        }

        function formatDate(dateString: string) {
          return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date(dateString))
        }

        export default function SettingsClient({ initialKeys }: { initialKeys: ApiKey[] }) {
          const [keys, setKeys] = useState(initialKeys)
          const [newKeyName, setNewKeyName] = useState('')
          const [creating, setCreating] = useState(false)
          const [revealedKey, setRevealedKey] = useState<string | null>(null)
          const [copied, setCopied] = useState(false)
          const [error, setError] = useState('')

          const handleCreate = async () => {
            if (!newKeyName.trim()) return

            setCreating(true)
            setError('')

            try {
              const response = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName.trim() }),
              })

              const data = await response.json()
              if (!response.ok) throw new Error(data.error ?? 'Failed to create API key.')

              setRevealedKey(data.key)
              setKeys((current) => [
                {
                  id: data.id,
                  name: data.name,
                  key: data.maskedKey,
                  createdAt: data.createdAt,
                  lastUsed: data.lastUsed,
                },
                ...current,
              ])
              setNewKeyName('')
            } catch (caughtError) {
              setError(caughtError instanceof Error ? caughtError.message : 'Failed to create API key.')
            } finally {
              setCreating(false)
            }
          }

          const handleDelete = async (id: string) => {
            if (!window.confirm('Revoke this API key? This cannot be undone.')) return

            const response = await fetch('/api/keys', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            })

            if (response.ok) {
              setKeys((current) => current.filter((key) => key.id !== id))
            }
          }

          const copyRevealedKey = async () => {
            if (!revealedKey) return
            await navigator.clipboard.writeText(revealedKey)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          }

          return (
            <div className="min-h-screen bg-[#080808]">
              <div className="border-b border-[#1d1d1d] bg-[#0c0c0c]/90 px-5 py-5 backdrop-blur md:px-8">
                <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Settings</p>
                <h1 className="mt-2 text-2xl font-semibold text-zinc-50">API keys</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Manage CLI access for PromptVault and keep track of active integrations.
                </p>
              </div>

              <div className="grid gap-6 px-5 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                  {revealedKey && (
                    <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-emerald-300">API key created</p>
                          <p className="mt-1 text-sm text-emerald-100/70">
                            Copy this key now. For security, PromptVault only shows the full value once.
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => setRevealedKey(null)}>
                          Dismiss
                        </Button>
                      </div>
                      <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-[#0b0b0b] p-4 font-mono text-sm break-all text-emerald-200">
                        {revealedKey}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button onClick={copyRevealedKey}>{copied ? 'Copied' : 'Copy key'}</Button>
                      </div>
                    </section>
                  )}

                  <section className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 md:p-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Create key</p>
                      <h2 className="mt-2 text-xl font-semibold text-zinc-50">Generate a new API key</h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        Keys can be used by the CLI or external scripts to read and update your prompt vault.
                      </p>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Input
                        value={newKeyName}
                        onChange={(event) => setNewKeyName(event.target.value)}
                        placeholder="e.g. local-dev, CI runner"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleCreate()
                        }}
                      />
                      <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
                        {creating ? 'Creating...' : 'Create key'}
                      </Button>
                    </div>
                    {error && <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
                  </section>

                  <section className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 md:p-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Active keys</p>
                        <h2 className="mt-2 text-xl font-semibold text-zinc-50">Your API access list</h2>
                      </div>
                      <p className="text-sm text-zinc-500">{keys.length} total key{keys.length === 1 ? '' : 's'}</p>
                    </div>

                    <div className="mt-5 space-y-3">
                      {keys.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-6 py-12 text-center text-sm text-zinc-500">
                          No API keys yet. Create one to connect the PromptVault CLI.
                        </div>
                      ) : (
                        keys.map((key) => (
                          <div key={key.id} className="rounded-2xl border border-[#222222] bg-[#121212] p-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                                  <p className="text-sm font-semibold text-zinc-100">{key.name}</p>
                                </div>
                                <p className="mt-2 font-mono text-xs text-zinc-400">{key.key}</p>
                                <p className="mt-2 text-xs text-zinc-500">
                                  Created {formatDate(key.createdAt)}
                                  {key.lastUsed ? ` • Last used ${formatDate(key.lastUsed)}` : ' • Never used'}
                                </p>
                              </div>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(key.id)}>
                                Revoke
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                  <section className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 md:p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">CLI setup</p>
                    <h2 className="mt-2 text-xl font-semibold text-zinc-50">Use PromptVault from your terminal</h2>
                    <div className="mt-5 rounded-2xl border border-[#1f1f1f] bg-[#0b0b0b] p-4 font-mono text-xs leading-6 text-zinc-300">
                      npm install -g promptvault

export PROMPTVAULT_API_KEY=pv_...

pvault list
pvault save "sales-agent" --file ./prompt.txt
pvault diff sales-agent v1 v2
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          )
        }
