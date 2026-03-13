import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getUserFromSession() {
  const session: any = await auth()
  if (!session?.user?.email) {
    return null
  }
  return prisma.user.findUnique({
    where: { email: session.user.email }
  })
}

// POST /api/canvases/[id]/blocks
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: user.id }
  })

  if (!canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
  }

  const body = await request.json()
  const { name, content, type, positionX, positionY, color } = body

  const block = await prisma.promptBlock.create({
    data: {
      canvasId: id,
      userId: user.id,
      name: name || 'New Block',
      content: content || '',
      type: type || 'prompt',
      positionX: positionX || 100 + Math.random() * 200,
      positionY: positionY || 100 + Math.random() * 200,
      color: color || '#F59E0B'
    }
  })

  await prisma.canvas.update({
    where: { id },
    data: { updatedAt: new Date() }
  })

  return NextResponse.json(block)
}

// GET /api/canvases/[id]/blocks
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: user.id }
  })

  if (!canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
  }

  const blocks = await prisma.promptBlock.findMany({
    where: { canvasId: id },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json(blocks)
}
