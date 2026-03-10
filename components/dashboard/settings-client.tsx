'use client'

        import { useState } from 'react'
        import { Button } from '@/components/ui/button'
        import CopyButton from '@/components/ui/copy-button'
        import { Input } from '@/components/ui/input'
        import { formatRelativeTime } from '@/lib/format'

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
          const [revealedKey, setRevealedKey] = useState<string | null>(null)
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

          return (
            <div className="min-h-screen bg-[#080808]">
              <div className="border-b border-[#171717] bg-[#0c0c0c] px-4 py-4 md:px-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Settings</p>
                <h1 className="mt-1.5 text-xl font-semibold text-zinc-50">API keys</h1>
                <p className="mt-1 text-sm text-zinc-500">Create keys for the CLI and revoke the ones you no longer need.</p>
              </div>

              <div className="grid gap-4 px-4 py-4 md:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  {revealedKey && (
                    <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-300">API key created</p>
                          <p className="mt-1 text-sm text-emerald-100/70">Copy this key now. PromptVault only shows the full value once.</p>
                        </div>
                        <Button variant="outline" onClick={() => setRevealedKey(null)} className="h-8 rounded-lg px-3">
                          Dismiss
                        </Button>
                      </div>
                      <div className="mt-3 rounded-lg border border-emerald-500/20 bg-[#0b0b0b] p-3 font-mono text-[13px] text-emerald-200 break-all">
                        {revealedKey}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <CopyButton value={revealedKey} label="Copy key" copiedLabel="Copied" />
                      </div>
                    </section>
                  )}

                  <section className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Create key</p>
                    <h2 className="mt-1 text-sm font-semibold text-zinc-50">Generate a new API key</h2>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={newKeyName}
                        onChange={(event) => setNewKeyName(event.target.value)}
                        placeholder="e.g. local-dev, CI runner"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleCreate()
                        }}
                      />
                      <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()} className="h-9 rounded-lg px-3">
                        {creating ? 'Creating...' : 'Create key'}
                      </Button>
                    </div>
                    {error && <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
                  </section>

                  <section className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Active keys</p>
                        <h2 className="mt-1 text-sm font-semibold text-zinc-50">Your API access list</h2>
                      </div>
                      <p className="text-[11px] text-zinc-600">{keys.length} total</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {keys.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[#222222] bg-[#0d0d0d] px-4 py-8 text-center text-sm text-zinc-500">
                          No API keys yet. Create one to connect PromptVault from your terminal.
                        </div>
                      ) : (
                        keys.map((key) => (
                          <div key={key.id} className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-3">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                                  <p className="text-sm font-medium text-zinc-100">{key.name}</p>
                                </div>
                                <p className="mt-2 font-mono text-[12px] text-zinc-500">{key.key}</p>
                                <p className="mt-2 text-[12px] text-zinc-500">
                                  Created {formatRelativeTime(key.createdAt)}
                                  {key.lastUsed ? ` · Last used ${formatRelativeTime(key.lastUsed)}` : ' · Never used'}
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

                <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
                  <section className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">CLI setup</p>
                    <h2 className="mt-1 text-sm font-semibold text-zinc-50">Use PromptVault from your terminal</h2>
                    <div className="mt-3 rounded-lg border border-[#181818] bg-[#0b0b0b] p-3 font-mono text-[12px] leading-6 text-zinc-300">
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
