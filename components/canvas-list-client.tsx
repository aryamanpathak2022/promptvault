'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BlockPreview {
  name: string
  color: string
  type: string
}

interface Canvas { 
  id: string
  name: string
  isPublic: boolean
  _count: { blocks: number; connections: number }
  preview?: BlockPreview[]
}

export default function CanvasListClient({ initialCanvases }: { initialCanvases: Canvas[] }) {
  const router = useRouter()
  const [forkingId, setForkingId] = useState<string | null>(null)

  const forkCanvas = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setForkingId(id)
    const res = await fetch('/api/canvases', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ forkFromId: id }), credentials: 'include' })
    if (res.ok) {
      const canvas = await res.json()
      router.push(`/dashboard/canvas/${canvas.id}`)
    }
    setForkingId(null)
  }

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-white mb-1">Prompt Canvas</h1><p style={{ color: '#888' }}>Build complex prompts with blocks</p></div>
          <Link href="/dashboard/canvas/new" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#F59E0B', color: '#080808' }}>+ New Canvas</Link>
        </div>

        {initialCanvases.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#141414' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: '#555' }}><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No canvases yet</h3>
            <Link href="/dashboard/canvas/new" className="px-6 py-3 rounded-lg font-medium inline-block" style={{ background: '#F59E0B', color: '#080808' }}>Create Canvas</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialCanvases.map(canvas => (
              <div key={canvas.id} className="group relative p-4 rounded-xl" style={{ background: '#141414', border: '1px solid #222' }}>
                <Link href={`/dashboard/canvas/${canvas.id}`} className="block">
                  {/* Preview tags */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {canvas.preview?.map((block, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ background: `${block.color}15`, border: `1px solid ${block.color}30`, color: block.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: block.color }} />
                        {block.name}
                      </span>
                    ))}
                    {(!canvas.preview || canvas.preview.length === 0) && (
                      <span className="text-xs px-2 py-1 rounded" style={{ background: '#1a1a1a', color: '#555' }}>No blocks</span>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">{canvas.name}</h3>
                      <div className="flex gap-3 text-xs" style={{ color: '#555' }}>
                        <span>{canvas._count.blocks} blocks</span>
                        <span>{canvas._count.connections} links</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#F59E0B' }}><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </div>
                  </div>
                </Link>
                <button onClick={e => forkCanvas(canvas.id, e)} className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#1a1a1a', color: '#888' }} title="Fork">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M18 9v2a2 2 0 01-2 2H8a2 2 0 01-2-2V9M12 6v4M8 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
