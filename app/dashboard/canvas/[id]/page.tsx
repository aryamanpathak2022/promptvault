'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Block {
  id: string
  name: string
  content: string
  type: string
  positionX: number
  positionY: number
  color: string
  width: number
  height: number
}

interface Connection {
  id: string
  sourceBlockId: string
  targetBlockId: string
}

const COLORS = [
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Green', color: '#10B981' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#8B5CF6' },
]

export default function CanvasEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [canvasId, setCanvasId] = useState<string | null>(null)
  const [canvasName, setCanvasName] = useState('Untitled Canvas')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [dragState, setDragState] = useState<{ blockId: string; startX: number; startY: number; blockStartX: number; blockStartY: number } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(p => {
      if (p.id === 'new') {
        createCanvas()
      } else {
        setCanvasId(p.id)
        loadCanvas(p.id)
      }
    })
  }, [params])

  const createCanvas = async () => {
    const res = await fetch('/api/canvases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Untitled Canvas' }),
      credentials: 'include'
    })
    if (res.ok) {
      const canvas = await res.json()
      router.push(`/dashboard/canvas/${canvas.id}`)
    }
  }

  const loadCanvas = async (id: string) => {
    try {
      const res = await fetch(`/api/canvases/${id}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCanvasName(data.name)
        setBlocks(data.blocks || [])
        setConnections(data.connections || [])
      }
    } catch (e) {
      console.error('Failed to load canvas:', e)
    } finally {
      setLoading(false)
    }
  }

  const addBlock = async (type: string) => {
    if (!canvasId) return
    const color = COLORS[Math.floor(Math.random() * COLORS.length)].color
    const name = type === 'system' ? 'System' : type === 'context' ? 'Context' : 'Prompt'
    
    const res = await fetch(`/api/canvases/${canvasId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content: '', type, positionX: menuPos.x, positionY: menuPos.y, color }),
      credentials: 'include'
    })
    if (res.ok) {
      const block = await res.json()
      setBlocks(prev => [...prev, block])
    }
    setShowMenu(false)
  }

  const updateBlock = async (blockId: string, updates: Partial<Block>) => {
    if (!canvasId) return
    await fetch(`/api/canvases/${canvasId}/blocks/${blockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include'
    })
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b))
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteBlock = async (blockId: string) => {
    if (!canvasId) return
    await fetch(`/api/canvases/${canvasId}/blocks/${blockId}`, { method: 'DELETE', credentials: 'include' })
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    setConnections(prev => prev.filter(c => c.sourceBlockId !== blockId && c.targetBlockId !== blockId))
    if (selectedBlock?.id === blockId) setSelectedBlock(null)
  }

  const addConnection = async (sourceId: string, targetId: string) => {
    if (!canvasId) return
    const res = await fetch(`/api/canvases/${canvasId}/connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceBlockId: sourceId, targetBlockId: targetId }),
      credentials: 'include'
    })
    if (res.ok) {
      const conn = await res.json()
      setConnections(prev => [...prev, conn])
    }
    setIsConnecting(false)
    setConnectingFrom(null)
  }

  const deleteConnection = async (connId: string) => {
    if (!canvasId) return
    await fetch(`/api/canvases/${canvasId}/connections?connectionId=${connId}`, { method: 'DELETE', credentials: 'include' })
    setConnections(prev => prev.filter(c => c.id !== connId))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedBlock(null)
      setShowMenu(false)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX - 280, y: e.clientY - 100 })
    setShowMenu(true)
  }

  const handleBlockMouseDown = (e: React.MouseEvent, block: Block) => {
    e.stopPropagation()
    if (isConnecting && connectingFrom && connectingFrom !== block.id) {
      addConnection(connectingFrom, block.id)
    } else {
      setSelectedBlock(block)
      setDragState({
        blockId: block.id,
        startX: e.clientX,
        startY: e.clientY,
        blockStartX: block.positionX,
        blockStartY: block.positionY
      })
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState) {
      const dx = e.clientX - dragState.startX
      const dy = e.clientY - dragState.startY
      setBlocks(prev => prev.map(b => 
        b.id === dragState.blockId 
          ? { ...b, positionX: Math.max(0, dragState.blockStartX + dx), positionY: Math.max(0, dragState.blockStartY + dy) }
          : b
      ))
    }
  }, [dragState])

  const handleMouseUp = useCallback(() => {
    if (dragState && canvasId) {
      const block = blocks.find(b => b.id === dragState.blockId)
      if (block) {
        updateBlock(block.id, { positionX: block.positionX, positionY: block.positionY })
      }
    }
    setDragState(null)
  }, [dragState, blocks, canvasId])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const getBlockById = (id: string) => blocks.find(b => b.id === id)

  const renderConnections = () => connections.map(conn => {
    const src = getBlockById(conn.sourceBlockId)
    const tgt = getBlockById(conn.targetBlockId)
    if (!src || !tgt) return null
    const sx = src.positionX + src.width, sy = src.positionY + src.height / 2
    const tx = tgt.positionX, ty = tgt.positionY + tgt.height / 2
    return <path key={conn.id} d={`M ${sx} ${sy} C ${(sx+tx)/2} ${sy}, ${(sx+tx)/2} ${ty}, ${tx} ${ty}`} fill="none" stroke="#555" strokeWidth="2" onClick={() => deleteConnection(conn.id)} style={{ cursor: 'pointer' }} />
  })

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808', color: '#F59E0B' }}>Loading...</div>

  return (
    <div className="h-screen flex flex-col" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: '#222', background: '#0f0f0f' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/canvas')} className="p-2 rounded-lg hover:bg-white/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#888' }}><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <input value={canvasName} onChange={e => { setCanvasName(e.target.value); fetch(`/api/canvases/${canvasId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: e.target.value }), credentials: 'include' })}} className="bg-transparent text-white font-medium outline-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsConnecting(!isConnecting)} className={`px-3 py-1.5 rounded-lg text-sm ${isConnecting ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-400'}`}>{isConnecting ? 'Select target...' : '+ Connect'}</button>
          <button onClick={() => setShowMenu(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#F59E0B', color: '#080808' }}>+ Add</button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={canvasRef} className="flex-1 relative overflow-hidden" onMouseDown={handleMouseDown} onContextMenu={handleContextMenu} style={{ background: '#0a0a0a', backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>{renderConnections()}</svg>

        {blocks.map(block => (
          <div key={block.id} className={`absolute rounded-xl cursor-move transition-shadow ${selectedBlock?.id === block.id ? 'ring-2' : ''}`}
            style={{ left: block.positionX, top: block.positionY, width: block.width, minHeight: block.height, background: '#141414', border: `2px solid ${selectedBlock?.id === block.id ? block.color : '#333'}`, zIndex: selectedBlock?.id === block.id ? 10 : 1 }}
            onMouseDown={e => handleBlockMouseDown(e, block)}>
            <div className="flex items-center justify-between px-3 py-2 rounded-t-lg" style={{ background: `${block.color}15`, borderBottom: `1px solid ${block.color}30` }}>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: block.color }} /><span className="text-xs" style={{ color: '#888' }}>{block.type}</span></div>
              <div className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); handleConnectClick(block.id) }} className="p-1 rounded hover:bg-white/10"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: isConnecting && connectingFrom === block.id ? block.color : '#666' }}><circle cx="5" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="19" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M8 12h8" stroke="currentColor" strokeWidth="2"/></svg></button>
                <button onClick={e => { e.stopPropagation(); deleteBlock(block.id) }} className="p-1 rounded hover:bg-white/10"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#666' }}><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
              </div>
            </div>
            <div className="px-3 py-2"><input value={block.name} onChange={e => updateBlock(block.id, { name: e.target.value })} onClick={e => e.stopPropagation()} className="w-full bg-transparent text-white text-sm outline-none" /></div>
            <div className="px-3 pb-3"><textarea value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} onClick={e => e.stopPropagation()} className="w-full h-20 bg-black/30 rounded-lg p-2 text-xs outline-none resize-none" style={{ color: '#aaa', border: '1px solid #222' }} placeholder="Use @blockName to reference..." /></div>
            <div className="absolute w-3 h-3 rounded-full" style={{ right: -6, top: '50%', transform: 'translateY(-50%)', background: block.color }} onClick={e => { e.stopPropagation(); handleConnectClick(block.id) }} />
            <div className="absolute w-3 h-3 rounded-full" style={{ left: -6, top: '50%', transform: 'translateY(-50%)', background: block.color }} onClick={e => { e.stopPropagation(); handleConnectClick(block.id) }} />
          </div>
        ))}

        {blocks.length === 0 && <div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><p style={{ color: '#666' }}>Right-click to add blocks</p></div></div>}
      </div>

      {/* Sidebar */}
      {selectedBlock && (
        <div className="w-80 border-l p-4 space-y-4" style={{ borderColor: '#222', background: '#0f0f0f' }}>
          <div className="flex justify-between"><h3 className="font-medium text-white">Block Settings</h3><button onClick={() => setSelectedBlock(null)} className="p-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#666' }}><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button></div>
          <div><label className="text-xs" style={{ color: '#666' }}>Type</label><select value={selectedBlock.type} onChange={e => updateBlock(selectedBlock.id, { type: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ background: '#141414', border: '1px solid #333', color: '#fff' }}><option value="prompt">Prompt</option><option value="system">System</option><option value="context">Context</option></select></div>
          <div><label className="text-xs" style={{ color: '#666' }}>Color</label><div className="flex gap-2 mt-1">{COLORS.map(c => <button key={c.color} onClick={() => updateBlock(selectedBlock.id, { color: c.color })} className={`w-8 h-8 rounded-lg ${selectedBlock.color === c.color ? 'ring-2 ring-white' : ''}`} style={{ background: c.color }} />)}</div></div>
          <div><label className="text-xs" style={{ color: '#666' }}>Content</label><textarea value={selectedBlock.content} onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })} className="w-full mt-1 h-48 px-3 py-2 rounded-lg text-sm resize-none" style={{ background: '#141414', border: '1px solid #333', color: '#fff' }} placeholder="Use @blockName..." /></div>
          <div><label className="text-xs" style={{ color: '#666' }}>Preview</label><div className="p-3 rounded-lg text-xs whitespace-pre-wrap" style={{ background: '#1a1a1a', color: '#888' }}>{selectedBlock.content}</div></div>
        </div>
      )}

      {/* Menu */}
      {showMenu && (
        <div className="absolute z-50 w-48 rounded-xl overflow-hidden" style={{ left: Math.max(10, menuPos.x), top: Math.max(10, menuPos.y), background: '#141414', border: '1px solid #333' }}>
          {['prompt', 'system', 'context'].map(type => <button key={type} onClick={() => addBlock(type)} className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-white/5" style={{ color: '#fff' }}><div className="w-3 h-3 rounded-full" style={{ background: COLORS[type === 'prompt' ? 0 : type === 'system' ? 3 : 1].color }} />{type.charAt(0).toUpperCase() + type.slice(1)}</button>)}
        </div>
      )}
      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
    </div>
  )

  function handleConnectClick(blockId: string) {
    if (!isConnecting) { setIsConnecting(true); setConnectingFrom(blockId) }
    else if (connectingFrom && connectingFrom !== blockId) { addConnection(connectingFrom, blockId) }
    else { setIsConnecting(false); setConnectingFrom(null) }
  }
}
