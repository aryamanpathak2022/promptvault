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

// GET /api/canvases/[id]/blocks/[blockId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { blockId } = await params

  const block = await prisma.promptBlock.findFirst({
    where: { id: blockId, userId: user.id }
  })

  if (!block) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 })
  }

  return NextResponse.json(block)
}

// PUT /api/canvases/[id]/blocks/[blockId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { blockId } = await params

  const block = await prisma.promptBlock.findFirst({
    where: { id: blockId, userId: user.id }
  })

  if (!block) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 })
  }

  const body = await request.json()
  const { name, content, type, positionX, positionY, color, width, height } = body

  const updated = await prisma.promptBlock.update({
    where: { id: blockId },
    data: {
      ...(name !== undefined && { name }),
      ...(content !== undefined && { content }),
      ...(type !== undefined && { type }),
      ...(positionX !== undefined && { positionX }),
      ...(positionY !== undefined && { positionY }),
      ...(color !== undefined && { color }),
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height })
    }
  })

  await prisma.canvas.update({
    where: { id: block.canvasId },
    data: { updatedAt: new Date() }
  })

  return NextResponse.json(updated)
}

// DELETE /api/canvases/[id]/blocks/[blockId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { blockId, id: canvasId } = await params

  const block = await prisma.promptBlock.findFirst({
    where: { id: blockId, userId: user.id }
  })

  if (!block) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 })
  }

  await prisma.blockConnection.deleteMany({
    where: {
      OR: [
        { sourceBlockId: blockId },
        { targetBlockId: blockId }
      ]
    }
  })

  await prisma.promptBlock.delete({ where: { id: blockId } })

  await prisma.canvas.update({
    where: { id: canvasId },
    data: { updatedAt: new Date() }
  })

  return NextResponse.json({ success: true })
}
