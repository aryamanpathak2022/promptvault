import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'
import CanvasListClient from '@/components/canvas-list-client'

export default async function CanvasListPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const canvases = await prisma.canvas.findMany({
    where: { userId: user.id },
    include: {
      blocks: { take: 3, orderBy: { createdAt: 'asc' } },
      _count: { select: { blocks: true, connections: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const serialized = canvases.map(canvas => ({
    id: canvas.id,
    name: canvas.name,
    description: canvas.description || undefined,
    isPublic: canvas.isPublic,
    createdAt: canvas.createdAt.toISOString(),
    updatedAt: canvas.updatedAt.toISOString(),
    _count: {
      blocks: canvas._count.blocks,
      connections: canvas._count.connections
    },
    preview: canvas.blocks.slice(0, 3).map(b => ({
      name: b.name,
      color: b.color,
      type: b.type
    }))
  }))

  return <CanvasListClient initialCanvases={serialized} />
}
